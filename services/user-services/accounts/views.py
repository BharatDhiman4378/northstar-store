import token
from tokenize import TokenError

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception = True)
        user = serializer.save()

        return Response({
            "message": "Account created successfully.",
            "user" :{
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
        }, status = status.HTTP_201_CREATED
        )

class ProfileView(APIView):
        permission_classes = [permissions.IsAuthenticated]

        def get(self,request):
            user = request.user

            return Response({
                "id" : user.id,
                "email" : user.email,
                "first_name" : user.first_name,
                "last_name" : user.last_name,
            })

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Why does logout reqire a refresh token? 
    # Ans: Because the refresh token is used to obtain new access tokens. 
    # When a user logs out, we want to invalidate the refresh token so that it can no longer be 
    # used to get new access tokens. This helps ensure that the user's session is effectively 
    # terminated and that they cannot continue to access protected resources after logging out.

    def post(self,request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({
                "error" : "Refresh token is required."
            }, status = status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            if str(token["user_id"]) != str(request.user.pk):
                return Response(
                    {
                        "error": "Invalid refresh token for the current user."
                    },
                    status=status.HTTP_400_BAD_REQUEST)
            token.blacklist()   
               
        except TokenError:
            return Response({
                "error" : "Invalid or already revoked refresh token."
            }, status = status.HTTP_400_BAD_REQUEST)

        return Response({
            "message" : "Logout successful."
        }, status = status.HTTP_200_OK)

# Security Note:- Logging out invalidates the refresh token, but the access token remains valid until it expires.    