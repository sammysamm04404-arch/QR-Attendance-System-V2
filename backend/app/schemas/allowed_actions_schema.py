from pydantic import BaseModel


class AllowedActionsResponse(BaseModel):

    allowed_actions: list[str]