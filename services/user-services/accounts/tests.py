from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class RegistrationTests(APITestCase):

    def setUp(self):
        self.register_url = "/api/auth/register/"

        self.valid_payload = {
            "email": "customer@example.com",
            "first_name": "Alex",
            "last_name": "Morgan",
            "password": "NorthstarTest#4821",
            "password_confirmation": "NorthstarTest#4821",
        }

    def test_register_customer_successfully(self):
        response = self.client.post(
            self.register_url,
            self.valid_payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["message"],
            "Account created successfully.",
        )

        self.assertTrue(
            User.objects.filter(
                email="customer@example.com"
            ).exists()
        )

    def test_register_duplicate_email(self):
        User.objects.create_user(
            email="customer@example.com",
            password="ExistingPassword#4821",
            first_name="Existing",
            last_name="Customer",
        )

        response = self.client.post(
            self.register_url,
            self.valid_payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_register_with_mismatched_passwords(self):
        payload = self.valid_payload.copy()
        payload["password_confirmation"] = "DifferentPassword#4821"

        response = self.client.post(
            self.register_url,
            payload,
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.email = "customer@example.com"
        self.password = "NorthstarTest#4821"

        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
            first_name="Alex",
            last_name="Morgan",
        )

        self.login_url = "/api/auth/login/"
        self.refresh_url = "/api/auth/token/refresh/"
        self.profile_url = "/api/auth/profile/"
        self.logout_url = "/api/auth/logout/"

    def test_login_successfully(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.email,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_login_with_wrong_password(self):
        response = self.client.post(
            self.login_url,
            {
                "email": self.email,
                "password": "WrongPassword#123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_profile_with_valid_access_token(self):
        refresh = RefreshToken.for_user(self.user)
        access_token = str(refresh.access_token)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["email"],
            self.email,
        )

    def test_profile_without_access_token(self):
        response = self.client.get(self.profile_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_refresh_token_successfully(self):
        refresh = RefreshToken.for_user(self.user)

        response = self.client.post(
            self.refresh_url,
            {"refresh": str(refresh)},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_logout_blacklists_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        refresh_token = str(refresh)

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.logout_url,
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        refresh_response = self.client.post(
            self.refresh_url,
            {"refresh": refresh_token},
            format="json",
        )

        self.assertEqual(
            refresh_response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )