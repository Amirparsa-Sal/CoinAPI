subscribe_schema = {
    "type": "object",
    "properties": {
        "email": {"type": "string", "pattern": "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"},
        "coin_name": {"type": "string"},
        "difference_percent": {"type": "integer", "minimum": 0, "maximum": 100},
    },
    "required": ["email", "coin_name", "difference_percent"]
}