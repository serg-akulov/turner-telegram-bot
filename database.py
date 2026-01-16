# Author: Sergey Akulov
# GitHub: https://github.com/serg-akulov

import pymysql
import config

def get_connection():
    return pymysql.connect(
        host=config.DB_HOST, user=config.DB_USER, password=config.DB_PASS,
        database=config.DB_NAME, cursorclass=pymysql.cursors.DictCursor, autocommit=True
    )

def get_bot_config():
    conn = get_connection()
    cfg = {}
    with conn.cursor() as cursor:
        cursor.execute("SELECT key_name, value_text FROM settings")
        for row in cursor.fetchall(): cfg[row['key_name']] = row['value_text']
        cursor.execute("SELECT cfg_key, cfg_value FROM bot_config")
        for row in cursor.fetchall(): cfg[row['cfg_key']] = row['cfg_value']
    conn.close()
    return cfg

def update_setting(key, val):
    conn = get_connection()
    with conn.cursor() as cur: cur.execute("UPDATE settings SET value_text=%s WHERE key_name=%s", (val, key))
    conn.close()

def create_order(user_id, username, full_name):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders (user_id, username, full_name, status) VALUES (%s, %s, %s, 'filling')", (user_id, username, full_name))
        oid = cur.lastrowid
    conn.close()
    return oid

def update_order_field(oid, field, val):
    conn = get_connection()
    with conn.cursor() as cur: cur.execute(f"UPDATE orders SET {field}=%s WHERE id=%s", (val, oid))
    conn.close()

def finish_order_creation(oid):
    conn = get_connection()
    with conn.cursor() as cur: cur.execute("UPDATE orders SET status='new' WHERE id=%s", (oid,))
    conn.close()

def get_order(oid):
    conn = get_connection()
    with conn.cursor() as cur: 
        cur.execute("SELECT * FROM orders WHERE id=%s", (oid,))
        res = cur.fetchone()
    conn.close()
    return res

def get_active_order_id(user_id):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM orders WHERE user_id=%s AND status='filling' ORDER BY id DESC LIMIT 1", (user_id,))
        res = cur.fetchone()
    conn.close()
    return res['id'] if res else None

def get_user_last_active_order(user_id):
    conn = get_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM orders WHERE user_id=%s AND status IN ('new','discussion','approved','work') ORDER BY id DESC LIMIT 1", (user_id,))
        res = cur.fetchone()
    conn.close()
    return res['id'] if res else None

# --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ---
def cancel_old_filling_orders(user_id):
    """Помечает все старые черновики как rejected (отменен/отказ)"""
    conn = get_connection()
    with conn.cursor() as cur:
        # БЫЛО: status='canceled' (Ошибка!)
        # СТАЛО: status='rejected' (Правильно!)
        cur.execute("UPDATE orders SET status='rejected' WHERE user_id=%s AND status='filling'", (user_id,))
    conn.close()

# --- НОВЫЕ ФУНКЦИИ ДЛЯ FASTAPI ---
def get_orders_paginated(limit=20, offset=0, status_filter=None):
    """Получить заказы с пагинацией"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            if status_filter:
                cur.execute("""
                    SELECT * FROM orders
                    WHERE status = %s
                    ORDER BY id DESC
                    LIMIT %s OFFSET %s
                """, (status_filter, limit, offset))
            else:
                cur.execute("""
                    SELECT * FROM orders
                    ORDER BY id DESC
                    LIMIT %s OFFSET %s
                """, (limit, offset))
            orders = cur.fetchall()
            return orders
    finally:
        conn.close()

def get_order_statistics():
    """Получить статистику заказов"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # Всего заказов
            cur.execute("SELECT COUNT(*) as total FROM orders")
            total = cur.fetchone()['total']

            # Новых заказов
            cur.execute("SELECT COUNT(*) as new FROM orders WHERE status = 'new'")
            new = cur.fetchone()['new']

            # Активных заказов (новые + в работе + обсуждение)
            cur.execute("""
                SELECT COUNT(*) as active FROM orders
                WHERE status IN ('new', 'discussion', 'approved', 'work')
            """)
            active = cur.fetchone()['active']

            return {
                "total_orders": total,
                "new_orders": new,
                "active_orders": active
            }
    finally:
        conn.close()

def update_bot_config(key, value):
    """Обновить настройку бота в таблице bot_config"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO bot_config (cfg_key, cfg_value, description)
                VALUES (%s, %s, '')
                ON DUPLICATE KEY UPDATE cfg_value = %s
            """, (key, value, value))
    finally:
        conn.close()