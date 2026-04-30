from typing import TypedDict, Optional


class AgentState(TypedDict, total=False):
    """
    Shared state across LangGraph nodes.
    Each node reads/writes fields from this state.
    """
    session_id: str
    # -------------------------
    # User Input
    # -------------------------
    uid: str
    request_id: str
    user_symptoms: str
    image_path: str

    # -------------------------
    # AI Analysis
    # -------------------------
    disease_identification: Optional[str]
    confidence: Optional[float]
    likely_symptoms: Optional[list]
    patient_friendly_explanation: Optional[str]
    root_cause_reason: Optional[str]
    steps_to_understand_and_manage: Optional[list]
    diet: Optional[dict]
    
    # Legacy fields for backward compatibility if needed by other nodes
    prediction: Optional[str]
    confidence_score: Optional[float]

    # -------------------------
    # Medical Knowledge Context
    # -------------------------
    db_context: Optional[str]
    medical_context: Optional[dict]

    # -------------------------
    # Explainable AI Outputs
    # -------------------------
    heatmap_path: Optional[str]
    heatmap_url: Optional[str]

    # -------------------------
    # Final AI Report
    # -------------------------
    final_report: Optional[str]
    report_path: Optional[str]

    # -------------------------
    # Cloud Storage URLs
    # -------------------------
    image_url: Optional[str]
    report_url: Optional[str]

    # -------------------------
    # Error Handling
    # -------------------------
    error: Optional[str]