from django.contrib import admin
from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at")
    search_fields = ("name", "slug")
    list_filter = ("is_active",)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "sku",
        "category",
        "price",
        "stock_quantity",
        "is_active",
    )
    search_fields = ("name", "sku", "description")
    list_filter = ("category", "is_active")
    list_select_related = ("category",)
    list_editable = ("price", "stock_quantity", "is_active")
    prepopulated_fields = {"slug": ("name",)}