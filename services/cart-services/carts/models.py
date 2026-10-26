
from django.db import models
from django.core.validators import MinValueValidator


class Cart(models.Model):
    # ID of the user from the separate User Service.
    # We intentionally do not create a cross-database foreign key.
    user_id = models.PositiveBigIntegerField(
        unique=True,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Cart for user {self.user_id}"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )

    # ID of the product from the separate Product Service.
    product_id = models.PositiveBigIntegerField()

    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "product_id"],
                name="unique_product_per_cart",
            ),
            models.CheckConstraint(
                condition=models.Q(quantity__gte=1),
                name="cart_item_quantity_at_least_one",
            ),
        ]

    def __str__(self):
        return (
            f"Product {self.product_id} "
            f"(quantity: {self.quantity})"
        )
