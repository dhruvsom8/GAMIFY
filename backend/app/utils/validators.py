def validate_required_fields(data: dict, fields: list) -> str | None:
    """Returns error message if any required field is missing, else None."""
    if not data:
        return "Request body is required"
    for field in fields:
        if field not in data or data[field] is None or data[field] == "":
            return f"'{field}' is required"
    return None
