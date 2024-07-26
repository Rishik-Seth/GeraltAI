import cv2
from simple_facerec import SimpleFacerec
import sqlite3 as sl
import time
import pafy
from datetime import datetime, timezone
from yt_dlp import YoutubeDL
from vidgear.gears import CamGear
from data_handling import supabase, DownloadAllTestImages
import json
import requests
import numpy as np


class CCTV:
    redColor = (0, 0, 200)
    greenColor = (0, 200, 0)
    blueColor = (200, 0, 0)

    lastUnknownFaceUploadTime = 0

    def __init__(self, url, location, sfr):
        self.url = url
        self.location = location
        self.sfr = sfr

    def run(self):
        img_resp = requests.get(self.url)
        frame = cv2.imdecode(np.array(bytearray(img_resp.content), dtype=np.uint8), -1)
        face_locations, ids = self.sfr.detect_known_faces(frame)
        unknownFaceDetected = False
        for face_loc, id in zip(face_locations, ids):
            y1, x2, y2, x1 = face_loc[0], face_loc[1], face_loc[2], face_loc[3]
            name = ""
            if id == "Unknown":
                color = self.redColor
                name = "Unknown"
                unknownFaceDetected = True
            else:
                color = self.greenColor
                name = "Known"
                try:
                    isMoved, name = UpdateLocationAndGetName(id, self.location)
                    if isMoved:
                        print(f"{name} went to {self.location}")

                except Exception as e:
                    print(e)
                    cv2.putText(
                        frame,
                        "Network error",
                        (10, 10),
                        cv2.FONT_HERSHEY_DUPLEX,
                        1,
                        self.blueColor,
                        2,
                    )
            cv2.putText(
                frame, name, (x1, y1 - 10), cv2.FONT_HERSHEY_DUPLEX, 1, color, 2
            )
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 4)
        try:
            if unknownFaceDetected:
                self.lastUnknownFaceUploadTime = UploadUnknownFaces(
                    frame, self.location, self.lastUnknownFaceUploadTime
                )
                print("Unknown Face Detected")
        except Exception as e:
            print("Failed Uploading Unknown Face Images", e)
        return frame


def UpdateLocationAndGetName(student_id, location):
    data = json.loads(
        supabase.table("student_table")
        .select("current_location, name, location_save_time")
        .eq("id", student_id)
        .execute()
        .json()
    )["data"][0]

    currentLoaction = data["current_location"]
    name = data["name"]
    lastLocationTIme = data["location_save_time"]
    if location == "test":
        return False, name
    if currentLoaction != location:
        currentTime = datetime.now(timezone.utc).isoformat()
        supabase.table("student_table").update(
            {
                "current_location": location,
                "location_save_time": currentTime,
            }
        ).eq("id", student_id).execute()

        if location == "outside":
            supabase.table("attendances").upsert(
                {
                    "user_id": student_id,
                    "out_time": currentTime,
                }
            ).execute()

        if location == "campus":
            supabase.table("attendances").update(
                {
                    "in_time": currentTime,
                }
            ).eq(
                "user_id", student_id
            ).eq("out_time", lastLocationTIme).execute()

        return True, name
    else:
        return False, name


def getCurrentTimeInInt():
    return int(time.time() * 1000)


def UploadUnknownFaces(frame, location, last_save):
    if location == "test":
        return last_save
    currentTime = getCurrentTimeInInt()
    if currentTime - last_save < 30 * 1000:  # 30 sec gap between uploads
        return last_save
    File = cv2.imencode(".jpg", frame)[1].tobytes()
    path = f"unknown.{location}.{currentTime}.jpg"
    supabase.storage.from_("unknown_faces").upload(
        file=File,
        path=path,
        file_options={"content-type": "image/jpg"},
    )
    publicUrl = supabase.storage.from_("unknown_faces").get_public_url(path)
    supabase.table("detected_unknown_faces").upsert(
        {
            "location": location,
            "captured_image_url": publicUrl,
        }
    ).execute()

    return currentTime


def StartMonitoring():
    print("Starting monitoring System...")
    sfr = SimpleFacerec()
    sfr.load_encoding_images("images/")
    selectedCCTV = 0
    cctvs = [
        CCTV("http://172.70.108.148:8080/shot.jpg", "test", sfr),
        # CCTV("http://172.70.108.148:8080/shot.jpg", "outside", sfr),
        # CCTV("http://192.168.133.233:8080/shot.jpg", "campus", sfr),
    ]
    print("Monitoring System Started :)")
    while True:
        for ind in range(len(cctvs)):
            try:

                frame = cctvs[ind].run()
            except Exception as e:
                print(e)
            # print(f"Frame {ind}: {frame}")  # Print the frame to check its value

            if frame is None:
                # print(f"Error: Frame {ind} is None")
                continue

            if ind == selectedCCTV:
                cv2.imshow(f"{cctvs[ind].location} Camera", frame)
        key = cv2.waitKey(10)
        if key == ord("q"):
            break

        if key == ord("n"):
            cv2.destroyAllWindows()
            selectedCCTV += 1
            selectedCCTV %= len(cctvs)

        if key == ord("p"):
            cv2.destroyAllWindows()
            selectedCCTV -= 1
            selectedCCTV += len(cctvs)
            selectedCCTV %= len(cctvs)

    cv2.destroyAllWindows()


if __name__ == "__main__":
    # cctv()
    if input("Do you want to download all test images? (y/n): ").lower() == "y":
        DownloadAllTestImages()
    StartMonitoring()
