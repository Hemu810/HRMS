from pydantic import BaseModel, EmailStr, Field, field_validator


class PayslipEmailRequest(BaseModel):
    to: EmailStr
    subject: str = Field(min_length=1, max_length=300)
    body: str = Field(min_length=1)
    htmlBody: str | None = None
    filename: str = Field(min_length=5, max_length=255)
    attachmentType: str = "application/pdf"
    attachmentBase64: str = Field(min_length=10)

    @field_validator("filename")
    @classmethod
    def filename_must_be_pdf(cls, value: str):
        if not value.lower().endswith(".pdf"):
            raise ValueError("filename must end with .pdf")
        return value

    @field_validator("attachmentType")
    @classmethod
    def attachment_must_be_pdf(cls, value: str):
        if value != "application/pdf":
            raise ValueError("attachmentType must be application/pdf")
        return value


class EmailLogOut(BaseModel):
    id: int
    recipient_email: str
    subject: str
    attachment_filename: str | None = None
    status: str
    provider_message_id: str | None = None
    error_message: str | None = None
    sent_at: str | None = None
    created_at: str
