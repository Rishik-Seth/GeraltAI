from django.shortcuts import render, HttpResponse, redirect, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.http.response import StreamingHttpResponse, JsonResponse
from .camera import Camera
import json
from utils.supabase import supabase
import jwt
import os
import cv2
import base64
import datetime
import numpy as np

# Create your views here.

detector = cv2.CascadeClassifier("./haarcascade_frontalface_default.xml")


@csrf_exempt
def login(request):
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        email = body.get("email")
        password = body.get("password")

        if email and password:
            try:
                res = supabase.auth.sign_in_with_password(
                    {
                        "email": email,
                        "password": password,
                    }
                )
                user_id = res.user.id
                data = json.loads(
                    supabase.table("user_table")
                    .select("*, student_table(*)")
                    .eq("id", user_id)
                    .execute()
                    .json()
                )["data"][0]

                token = jwt.encode(
                    {
                        "user_id": user_id,
                        "name": data["name"],
                        "role": data["role"],
                        "email": email,
                        "created_at": datetime.datetime.now().isoformat(),
                    },
                    os.getenv("JWT_SECRET"),
                    algorithm="HS256",
                )

                try:
                    token = token.decode("utf-8")
                except:
                    pass

                return JsonResponse(
                    {"message": "User Created", "token": token}, status=201
                )
            except Exception as e:
                print(e)
                return JsonResponse({"message": str(e)}, status=400)
        else:
            return JsonResponse(
                {"message": "Email and password are required"}, status=400
            )

    return JsonResponse({"message": "API not found Boooo!"}, status=404)


@csrf_exempt
def register(request):
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        name = body.get("name")
        roll_number: str = body.get("roll_number").upper()
        email = body.get("email")
        password = body.get("password")
        gender = body.get("gender")
        phone_number = body.get("phone_number")
        role = "student"
        frontend_url = {os.getenv("FRONTEND_URL")}
        if email.split("@")[1] != "iiitl.ac.in":
            return JsonResponse(
                {"message": "Only iiitl.ac.in email addresses are allowed"}, status=400
            )
        if roll_number.lower() != (email.split("@")[0]).lower():
            return JsonResponse(
                {"message": "Roll Number and Email should match"}, status=400
            )
        try:
            phone_number = int(phone_number)
        except:
            return JsonResponse(
                {"message": "Phone Number should be a number"}, status=400
            )

        if len(str(phone_number)) != 10:
            return JsonResponse(
                {"message": "Phone Number should be 10 digit"}, status=400
            )

        if email and password:
            try:
                res = supabase.auth.sign_up(
                    {
                        "email": email,
                        "password": password,
                        "redirect_to": f"{frontend_url}/welcome",
                    }
                )
                user_id = res.user.id
                data = {
                    "id": user_id,
                    "name": name,
                    "role": role,
                    "email": email,
                    "gender": gender,
                }
                data, count = supabase.table("user_table").upsert(data).execute()

                data = {
                    "id": user_id,
                    "name": name,
                    "roll_number": roll_number,
                    "phone_number": phone_number,
                }
                data, count = supabase.table("student_table").upsert(data).execute()

                token = jwt.encode(
                    {
                        "user_id": user_id,
                        "name": name,
                        "role": role,
                        "email": email,
                        "created_at": datetime.datetime.now().isoformat(),
                    },
                    os.getenv("JWT_SECRET"),
                    algorithm="HS256",
                )
                try:
                    token = token.decode("utf-8")
                except:
                    pass
                return JsonResponse(
                    {"message": "User Created", "token": token}, status=201
                )
            except Exception as e:
                return JsonResponse({"message": str(e)}, status=400)
        else:
            return JsonResponse(
                {"message": "Email and password are required"}, status=400
            )

    return JsonResponse({"message": "API not found Boooo!"}, status=404)


@csrf_exempt
def video_feed(request):
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        image = body.get("image")
        uploadedCount = body.get("uploadedCount")
        user_id = request.user.id

        if int(uploadedCount) >= 10:
            uploaded_images = []
            tries = 5
            while tries > 0:
                try:
                    images = supabase.storage.get_bucket(f"Images").list(path=user_id)
                    for image in images:
                        imageName = image["name"]
                        uploaded_images.append(
                            supabase.storage.from_("Images").get_public_url(
                                f"{user_id}/{imageName}"
                            )
                        )
                    tries = 0
                except Exception as e:
                    print("failed Gathering public Images", e)
                tries -= 1
            supabase.table("student_table").update(
                {"images_uploaded": True, "uploaded_images": uploaded_images}
            ).eq("id", user_id).execute()
            return JsonResponse({"message": "All Images Uploaded"}, status=201)
        try:
            image_data = base64.b64decode(image.split(",")[1])
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            try:
                gray = cv2.imdecode(nparr, cv2.COLOR_BGR2GRAY)
                faces = detector.detectMultiScale(gray, 1.1, 5)
                print(gray.shape)
                face_found = False
                if len(faces) == 1:
                    x, y, w, h = faces[0]

                    cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
                    try:
                        croppedFile = cv2.imencode(".jpg", gray)[1].tobytes()
                        path = f"{user_id}/User.{user_id}.{str(uploadedCount)}.jpg"
                        supabase.storage.from_("Images").upload(
                            file=croppedFile,
                            path=path,
                            file_options={"content-type": "image/jpg"},
                        )
                        face_found = True

                    except Exception as e:
                        print("error Uploading Image = ", e)
                        try:
                            supabase.storage.from_("Images").update(
                                file=croppedFile,
                                path=path,
                                file_options={"content-type": "image/jpg"},
                            )
                            print("Updated Image = ", path)
                            face_found = True
                        except Exception as e:
                            print(f"{e} Error in uploading image {path}")
                # ret, jpeg = cv2.imencode(".jpg", img)
                # toBytes = jpeg.tobytes()
                # # return toBytes
                # toBytes = (
                #     b"--frame\r\n"
                #     b"Content-Type: image/jpg\r\n\r\n" + toBytes + b"\r\n\r\n"
                # )
                return JsonResponse(
                    {
                        "message": ("face found" if face_found else "Image received"),
                        # "image": str(toBytes),
                    },
                    status=200,
                )
            except Exception as e:
                print("Errorring", e)
                return JsonResponse({"message": str(e)}, status=400)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "No Api Booo!"}, status=400)


@csrf_exempt
def myProfile(request):
    if request.method == "POST":
        user_id = request.user.id
        try:
            response = json.loads(
                supabase.table("user_table")
                .select("*,student_table(*)")
                .eq("id", user_id)
                .execute()
                .json()
            )["data"][0]
            pastFiveAttendance = json.loads(
                supabase.table("attendances")
                .select("*")
                .eq("user_id", user_id)
                .order(column="out_time", desc=True)
                .limit(5)
                .execute()
                .json()
            )["data"]
            response["last_five_attendances"] = pastFiveAttendance
            return JsonResponse(
                {"message": "Data user_table", "data": response}, status=200
            )
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "API not found Boooo!"}, status=404)


@csrf_exempt
def User_Data(request, user_id=""):
    if not user_id:
        return JsonResponse({"message": "User ID is required"}, status=400)
    if user_id != request.user.id and request.user.role != "admin":
        return JsonResponse(
            {"message": "You are not authorized to do this action"}, status=401
        )
    if request.method == "GET":
        try:
            uploaded_images = []
            images = supabase.storage.get_bucket(f"Images").list(path=user_id)
            for image in images:
                imageName = image["name"]
                uploaded_images.append(
                    supabase.storage.from_("Images").get_public_url(
                        f"{user_id}/{imageName}"
                    )
                )
        except Exception as e:
            print(e)

        try:
            response = json.loads(
                supabase.table("user_table")
                .select("*,student_table(*)")
                .eq("id", user_id)
                .execute()
                .json()
            )["data"][0]
            return JsonResponse({"message": "User Data", "data": response}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    elif request.method == "PUT":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        try:
            supabase.table("student_table").update(body).eq("id", user_id).execute()
            response = json.loads(
                supabase.table("user_table")
                .select("*,student_table(*)")
                .eq("id", user_id)
                .execute()
                .json()
            )["data"][0]
            return JsonResponse(
                {"message": "Data Updated", "data": response}, status=200
            )
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "API not found Boooo!"}, status=404)


@csrf_exempt
def upload_id_card(request):
    if request.method == "POST":
        file = request.FILES["file"]
        user_id = request.user.id
        file_extension = os.path.splitext(file.name)[1]
        file_name = f"{user_id}{file_extension}"
        file_data = file.read()

        # Upload the file to Supabase
        try:
            try:
                supabase.storage.from_("ID-Cards").upload(file_name, file_data)
            except Exception as e:
                supabase.storage.from_("ID-Cards").update(file_name, file_data)

            url_response = supabase.storage.from_("ID-Cards").get_public_url(file_name)
            supabase.table("student_table").update(
                {"college_id_card": url_response}
            ).eq("id", user_id).execute()
            return JsonResponse(
                {"message": "File uploaded successfully", "url": url_response},
                status=200,
            )
        except Exception as e:
            print(e)
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=400)


def get_all_students(request):
    if request.method == "GET":
        if request.user.role != "admin":
            return JsonResponse(
                {"message": "You are not authorized to do this action"}, status=401
            )
        try:
            response = supabase.table("student_table").select("*").execute().json()
            data = json.loads(response)["data"]

            return JsonResponse({"data": data, "message": "data Fetched"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "API not found Boooo!"}, status=404)


def Mark_Attendance(request):
    user_id = request.user.id
    if request.method == "POST":
        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        user_id = body.get("user_id")
        location = body.get("location")
        try:
            data = {
                "user_id": user_id,
                "location": location,
            }
            data, count = supabase.table("attendances").upsert(data).execute()
            return JsonResponse(
                {"message": "Attendance Marked", "data": data}, status=201
            )
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)


def GetAllAttendance(request):
    if request.method == "GET":
        if request.user.role != "admin":
            return JsonResponse(
                {"message": "You are not authorized to do this action"}, status=401
            )
        try:
            response = (
                supabase.table("attendances")
                .select("*, student_table(name,roll_number)")
                .order(column="out_time", desc=False)
                .execute()
                .json()
            )
            data = json.loads(response)["data"]
            return JsonResponse({"data": data, "message": "data Fetched"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "API not found Boooo!"}, status=404)


def stillOutStudents(request):
    if request.method == "GET":
        if request.user.role != "admin":
            return JsonResponse(
                {"message": "You are not authorized to do this action"}, status=401
            )
        try:
            response = (
                supabase.table("attendances")
                .select("*, student_table(name,roll_number,phone_number)")
                .is_("in_time", "null")
                .order(column="out_time", desc=False)
                .execute()
                .json()
            )
            data = json.loads(response)["data"]
            return JsonResponse({"data": data, "message": "data Fetched"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "API not found Boooo!"}, status=404)


def getAllUnknownFaces(request):
    if request.method == "GET":
        try:
            response = (
                supabase.table("detected_unknown_faces")
                .select("*")
                .is_("is_verified", "false")
                .order(column="time", desc=False)
                .execute()
                .json()
            )
            data = json.loads(response)["data"]
            return JsonResponse({"data": data, "message": "data Fetched"}, status=200)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)
    return JsonResponse({"message": "API not found Boooo!"}, status=404)

@csrf_exempt
def verifyUnknownFace(request, id):
    if request.method == "PUT":
        try:
            data = {
                "is_verified": True,
            }
            data, count = (
                supabase.table("detected_unknown_faces")
                .update(data)
                .eq("id", id)
                .execute()
            )
            return JsonResponse({"message": "Face Verified", "data": data}, status=201)
        except Exception as e:
            return JsonResponse({"message": str(e)}, status=400)

    return JsonResponse({"message": "API not found Boooo!"}, status=404)
