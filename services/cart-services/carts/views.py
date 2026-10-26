
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cart, CartItem
from .serializers import CartSerializer
from .product_client import get_product, ProductServiceError


def product_validation_error(product_id, quantity):
    try:
        product = get_product(product_id)
    except ProductServiceError as exc:
        return None, Response(
            {"detail": str(exc)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if product is None or not product["is_active"]:
        return None, Response(
            {"detail": "Product not found or unavailable."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if quantity > product["stock_quantity"]:
        return None, Response(
            {
                "detail": (
                    f"Only {product['stock_quantity']} unit(s) "
                    "are currently available."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    return product, None


class MyCartView(APIView):
    permission_classes = [IsAuthenticated]

    def get_cart(self):
        cart, _ = Cart.objects.get_or_create(
            user_id=self.request.user.pk
        )
        return cart

    def get(self, request):
        cart = self.get_cart()
        return Response(CartSerializer(cart).data)

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = request.data.get("quantity", 1)

        try:
            product_id = int(product_id)
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Product ID and quantity must be integers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if product_id <= 0 or quantity <= 0:
            return Response(
                {"detail": "Product ID and quantity must be positive."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            cart = self.get_cart()

            existing_item = CartItem.objects.filter(
                cart=cart,
                product_id=product_id,
            ).first()

            requested_quantity = quantity
            if existing_item:
                requested_quantity += existing_item.quantity

            _, error_response = product_validation_error(
                product_id,
                requested_quantity,
            )
            if error_response:
                return error_response

            item, created = CartItem.objects.get_or_create(
                cart=cart,
                product_id=product_id,
                defaults={"quantity": quantity},
            )

            if not created:
                item.quantity = requested_quantity
                item.save(update_fields=["quantity", "updated_at"])

        return Response(
            CartSerializer(cart).data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        quantity = request.data.get("quantity")

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity <= 0:
            return Response(
                {"detail": "Quantity must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_object_or_404(
            Cart,
            user_id=request.user.pk,
        )
        item = get_object_or_404(
            CartItem,
            cart=cart,
            pk=item_id,
        )

        _, error_response = product_validation_error(
            item.product_id,
            quantity,
        )
        if error_response:
            return error_response

        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])

        return Response(CartSerializer(cart).data)

    def delete(self, request, item_id):
        cart = get_object_or_404(
            Cart,
            user_id=request.user.pk,
        )
        item = get_object_or_404(
            CartItem,
            cart=cart,
            pk=item_id,
        )
        item.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
