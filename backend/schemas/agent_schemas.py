from pydantic import BaseModel, Field
from typing import List

class CBTBlock(BaseModel):
    category: str = Field(description="The CBT category (e.g., Focus, Rest, Communication, Grounding, Reflection)")
    activity: str = Field(description="A short description of the recommended activity")
    duration_mins: int = Field(description="Recommended duration in minutes")

class ClinicalAgentOutput(BaseModel):
    morning_block: CBTBlock
    afternoon_block: CBTBlock
    evening_block: CBTBlock
    tone: str = Field(description="The psychological tone adapted for the active Triguna")
