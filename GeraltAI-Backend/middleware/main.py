from django.http import JsonResponse
import jwt
import os
import re


class MyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        paths = [
            "/attendance/uploadImage/",
            "/attendance/me/",
            r"/attendance/user/.*/",
            "/attendance/uploadIdCard/",
            "/attendance/allStudents/",
            "/attendance/getAllAttendance/",
            "/attendance/stillOutStudents/",
        ]
        if any(re.match(path, request.path) for path in paths):
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            token = auth_header.split(" ")[1] if "Bearer" in auth_header else None
            if not token:
                return JsonResponse({"error": "Token not provided"}, status=401)

            # print(jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256']))
            try:
                # Replace 'your-secret-key' with your actual secret key
                payload = jwt.decode(
                    token, os.getenv("JWT_SECRET"), algorithms=["HS256"]
                )
                request.user.id = payload["user_id"]
                request.user.role = payload["role"]
            except jwt.ExpiredSignatureError:
                return JsonResponse({"error": "Token expired"}, status=401)
            except jwt.InvalidTokenError:
                return JsonResponse({"error": "Invalid/Expired token"}, status=401)
        response = self.get_response(request)
        return response
