from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import database
from routers.auth import verify_token

router = APIRouter()

# Pydantic модели
class OrderBase(BaseModel):
    id: int
    user_id: int
    username: Optional[str]
    full_name: str
    status: str
    work_type: Optional[str]
    dimensions_info: Optional[str]
    conditions: Optional[str]
    urgency: Optional[str]
    comment: Optional[str]
    photo_file_id: Optional[str]
    created_at: str
    internal_note: Optional[str]

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    internal_note: Optional[str] = None

class OrderStats(BaseModel):
    total_orders: int
    new_orders: int
    active_orders: int

@router.get("/", response_model=List[OrderBase])
async def get_orders(
    page: int = 1,
    limit: int = 20,
    status_filter: Optional[str] = None,
    payload: dict = Depends(verify_token)
):
    """Получить список заказов с пагинацией"""
    try:
        offset = (page - 1) * limit
        orders = database.get_orders_paginated(limit, offset, status_filter)
        return orders
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения заказов: {str(e)}")

@router.get("/stats", response_model=OrderStats)
async def get_order_stats(payload: dict = Depends(verify_token)):
    """Получить статистику заказов"""
    try:
        stats = database.get_order_statistics()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения статистики: {str(e)}")

@router.get("/{order_id}", response_model=OrderBase)
async def get_order(order_id: int, payload: dict = Depends(verify_token)):
    """Получить заказ по ID"""
    try:
        order = database.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")
        return order
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения заказа: {str(e)}")

@router.put("/{order_id}")
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    payload: dict = Depends(verify_token)
):
    """Обновить заказ"""
    try:
        if order_update.status:
            database.update_order_field(order_id, 'status', order_update.status)
        if order_update.internal_note is not None:
            database.update_order_field(order_id, 'internal_note', order_update.internal_note)

        return {"message": "Заказ обновлен успешно"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления заказа: {str(e)}")

@router.get("/{order_id}/photos")
async def get_order_photos(order_id: int, payload: dict = Depends(verify_token)):
    """Получить фото заказа"""
    try:
        order = database.get_order(order_id)
        if not order or not order['photo_file_id']:
            return {"photos": []}

        photos = order['photo_file_id'].split(',')
        return {"photos": photos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения фото: {str(e)}")