from django.urls import path
from .views import MyCartView, CartItemDetailView

urlpatterns = [
    path("my-cart/", MyCartView.as_view(), name="my-cart"),
    path(
        "items/<int:item_id>/",
        CartItemDetailView.as_view(),
        name="cart-item-detail",
    ),
]
