from pydantic import BaseModel, Field

class CBTBlock(BaseModel):
    category: str = Field(..., description="One of: Focus, Rest, Communication, Grounding, Reflection")
    title: str = Field(..., description="A short, actionable title for the block.")
    description: str = Field(..., description="Detailed instructions for this CBT block.")
    duration_minutes: int = Field(..., description="Recommended duration in minutes.")
    disclaimer: str = Field(
        default=(
            "This suggestion is for self-improvement purposes only and does not "
            "constitute medical or clinical advice. Please consult a licensed "
            "mental health professional for clinical support."
        )
    )

class ClinicalAgentOutput(BaseModel):
    """Structured output expected from the Clinical CBT Agent node."""
    blocks: list[CBTBlock] = Field(..., description="List of recommended CBT blocks for the user's day.")
