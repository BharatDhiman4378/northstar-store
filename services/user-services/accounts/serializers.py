from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, trim_whitespace = False, style = {'input_type':'password'})
    password_confirmation = serializers.CharField(write_only = True, trim_whitespace = False, style = {'input_type':'password'})

    class Meta:
        model =User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirmation",
        ]   
        read_only_fields = ["id"]

    def validate_email(self,value):
        value = value.strip().lower() 

        if User.objects.filter(email__iexact = value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        password = attrs.get("password")
        password_confirmation = attrs.get("password_confirmation")

        if password != password_confirmation:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        try:
            validate_password(password)
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})

        return attrs

    # def Create(self, validated_data):
    #     validated_data.pop("password_confirmation")
    #     password = validated_data.pop("password")

    #     user = User.objectsbjects.create_user(
    #         password = password,
    #         **validated_data,
    #     )

    #     return user

    def create(self, validated_data):
            validated_data.pop("password_confirmation")
            password = validated_data.pop("password")
    
            user = User(**validated_data)
            user.set_password(password)
            user.save()
    
            return user