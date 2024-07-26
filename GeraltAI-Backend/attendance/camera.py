import cv2
import tempfile
from utils.supabase import supabase

detector=cv2.CascadeClassifier('./haarcascade_frontalface_default.xml')

class Camera():
    def __init__(self,id) -> None:
        self.id = id
        self.video = cv2.VideoCapture(0)
        self.savedImagesCount = 0

    def __del__(self):
        cv2.destroyAllWindows()
        self.video.release()

    def get_frame(self):
        success, img = self.video.read()
        # cv2.imshow("Hello",img)
        # cv2.waitKey(1)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
        #now we call our classifier(detector)
        faces = detector.detectMultiScale(gray, 1.1, 5)
        if(len(faces)==1 and self.savedImagesCount<30):
            x,y,w,h = faces[0]
            
            cv2.rectangle(img,(x,y),(x+w,y+h),(255,0,0),2)

            supabase.storage.from_("Images").upload(
                file=cv2.imencode('.jpg',gray[y:y+h,x:x+w])[1].tobytes(),
                path=f'User.{self.id}.{str(self.savedImagesCount)}.jpg',
                file_options={"content-type": "image/jpg"}
            )
            self.savedImagesCount=self.savedImagesCount+1
            
        
        ret, jpeg = cv2.imencode('.jpg',img)
        toBytes = jpeg.tobytes()

        return toBytes