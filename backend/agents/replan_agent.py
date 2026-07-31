import logging
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from schemas.agent_schemas import CBTBlock
from agents.prompts import REPLAN_CBT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

async def replan_node(original_block: CBTBlock) -> CBTBlock:
    """
    Applies Fogg's Behavior Model (B=MAP) to drastically reduce the friction
    of a CBT block that the user found overwhelming.
    """
    try:
        # We use llama-3.3-70b-versatile for structured output reliability
        llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
        structured_llm = llm.with_structured_output(CBTBlock)
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", REPLAN_CBT_SYSTEM_PROMPT),
            ("user", "Here is the original overwhelming task:\n\n{block_json}\n\nPlease generate a heavily simplified, ultra-low-friction version of this task according to the rules.")
        ])
        
        chain = prompt | structured_llm
        
        result: CBTBlock = await chain.ainvoke({
            "block_json": original_block.model_dump_json(indent=2)
        })
        
        # Enforce the is_reframed flag just in case the LLM misses it
        result.is_reframed = True
        return result
        
    except Exception as e:
        logger.error(f"Replan execution failed: {e}")
        # Fallback: create a manual ultra-low friction block if LLM fails
        return CBTBlock(
            category=original_block.category,
            title="Take a Deep Breath",
            description="The system encountered an error reframing your task. Instead, please just take 3 slow, deep breaths. It's okay to step back.",
            duration_minutes=1,
            is_reframed=True
        )
