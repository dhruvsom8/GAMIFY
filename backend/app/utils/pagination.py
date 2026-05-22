def paginate_query(query, page: int, per_page: int) -> dict:
    """Generic pagination helper. Returns items + pagination metadata."""
    per_page = min(per_page, 100)  # cap at 100
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": [item.to_dict() for item in paginated.items],
        "pagination": {
            "page": paginated.page,
            "per_page": paginated.per_page,
            "total": paginated.total,
            "pages": paginated.pages,
            "has_next": paginated.has_next,
            "has_prev": paginated.has_prev,
        },
    }
