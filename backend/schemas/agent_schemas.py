from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class CBTCategoryEnum(str, Enum):
    GROUNDING = "Grounding"
    FOCUS = "Focus"
    REST = "Rest"
    COMMUNICATION = "Communication"
    REFLECTION = "Reflection"

class TimeBlockEnum(str, Enum):
    MORNING = "Morning"
    AFTERNOON = "Afternoon"
    EVENING = "Evening"

class CBTBlock(BaseModel):
    time_block: TimeBlockEnum = Field(description="Morning, Afternoon, or Evening block")
    category: CBTCategoryEnum = Field(description="Selected CBT category")
    task_title: str = Field(description="Actionable micro-habit name (under 10 words)")
    duration_minutes: int = Field(description="Recommended duration in minutes (5-15 mins)")
    instructions: str = Field(description="1-2 concise, low-friction execution steps")
    psychological_rationale: str = Field(description="1-sentence explanation of psychological benefit")

class ClinicalAgentOutput(BaseModel):
    daily_theme: str = Field(description="Summary theme framing planetary context as dynamic daily weather")
    tone_mode: str = Field(description="Adapted tone mode: Sattva | Rajas | Tamas")
    blocks: List[CBTBlock] = Field(description="Exactly 3 task blocks (Morning, Afternoon, Evening)")
