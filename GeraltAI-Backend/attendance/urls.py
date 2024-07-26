from django.urls import path
from . import views

# UrlConfig

urlpatterns = [
    path("uploadImage/", views.video_feed),
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("me/", views.myProfile, name="my_profile"),
    path("user/<str:user_id>/", views.User_Data, name="User_Data"),
    path("uploadIdCard/", views.upload_id_card, name="upload_id_card"),
    path("allStudents/", views.get_all_students, name="get_all_students"),
    path("getAllAttendance/", views.GetAllAttendance, name="GetAllAttendance"),
    path("stillOutStudents/", views.stillOutStudents, name="stillOutStudents"),
    path("getAllUnknownFaces/", views.getAllUnknownFaces, name="getAllUnknownFaces"),
    path("verifyUnknownFace/<str:id>/", views.verifyUnknownFace, name="verifyUnknownFace"),
]
