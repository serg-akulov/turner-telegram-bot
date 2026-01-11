from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import database
from routers.auth import verify_token

router = APIRouter()

class BotConfigUpdate(BaseModel):
    key: str
    value: str

@router.get("/")
async def get_bot_config(payload: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Получить все настройки бота"""
    try:
        config = database.get_bot_config()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения настроек: {str(e)}")

@router.put("/")
async def update_bot_config(
    config_update: BotConfigUpdate,
    payload: dict = Depends(verify_token)
):
    """Обновить настройку бота"""
    try:
        # Определяем, в какую таблицу сохранять
        if config_update.key in ['admin_chat_id', 'bot_token']:
            database.update_setting(config_update.key, config_update.value)
        else:
            database.update_bot_config(config_update.key, config_update.value)

        return {"message": "Настройка обновлена успешно"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления настройки: {str(e)}")

@router.get("/texts")
async def get_bot_texts(payload: dict = Depends(verify_token)) -> Dict[str, str]:
    """Получить тексты бота для конструктора"""
    try:
        config = database.get_bot_config()
        # Фильтруем только текстовые настройки
        text_keys = [
            'welcome_msg', 'step_photo_text', 'btn_skip_photo', 'step_type_text',
            'btn_type_repair', 'btn_type_copy', 'btn_type_drawing', 'step_dim_text',
            'step_cond_text', 'btn_cond_rotation', 'btn_cond_static', 'btn_cond_impact',
            'btn_cond_unknown', 'step_urgency_text', 'btn_urgency_high', 'btn_urgency_med',
            'btn_urgency_low', 'step_final_text', 'msg_done', 'err_photo_required',
            'msg_order_canceled'
        ]
        texts = {key: config.get(key, '') for key in text_keys}
        return texts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения текстов: {str(e)}")

@router.put("/texts")
async def update_bot_texts(
    texts: Dict[str, str],
    payload: dict = Depends(verify_token)
):
    """Обновить тексты бота"""
    try:
        for key, value in texts.items():
            database.update_bot_config(key, value)
        return {"message": "Тексты обновлены успешно"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления текстов: {str(e)}")

@router.get("/settings")
async def get_bot_settings(payload: dict = Depends(verify_token)) -> Dict[str, Any]:
    """Получить системные настройки бота"""
    try:
        config = database.get_bot_config()
        # Фильтруем только настройки (не тексты)
        settings_keys = [
            'is_photo_required', 'step_extra_enabled', 'admin_chat_id'
        ]
        settings = {key: config.get(key, '') for key in settings_keys}
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения настроек: {str(e)}")

@router.put("/settings")
async def update_bot_settings(
    settings: Dict[str, Any],
    payload: dict = Depends(verify_token)
):
    """Обновить системные настройки бота"""
    try:
        for key, value in settings.items():
            if key == 'admin_chat_id':
                database.update_setting(key, str(value))
            else:
                database.update_bot_config(key, str(value))
        return {"message": "Настройки обновлены успешно"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обновления настроек: {str(e)}")