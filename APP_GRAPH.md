# MediSeen App Graph

This file maps the main user flows, frontend routes, backend APIs, model pipeline, and deployment proxy in one place.

## Architecture Diagram

```mermaid
flowchart LR
  User[User on Web / Android]

  subgraph Frontend[Frontend: Next.js app/]
    Landing[Landing flow\napp/page.tsx]
    Home[/home\napp/home/page.tsx]
    Diagnose[/diagnose\napp/diagnose/page.tsx]
    Login[/login\napp/login/page.tsx]
    Register[/register\napp/register/page.tsx]
    Profile[/profile\napp/profile/page.tsx]
    DiseaseInfo[/disease-info\napp/disease-info/page.tsx]
    Wellness[/wellness\napp/wellness/page.tsx]
    Communication[/communication\napp/communication/page.tsx]

    UploadPanel[UploadPanel\nimage + symptoms submission]
    ResultPanel[ResultPanel\nresult + report viewer]
    HeatmapViewer[HeatmapViewer\nimage + heatmap overlay]
    Config[config.ts\nAPI base + asset URL resolver]
  end

  subgraph Runtime[Deployment runtime]
    Nginx[Nginx on :7860\nserves static export]
    APIProxy[/api/* -> FastAPI on 127.0.0.1:8000/]
    AssetProxy[/uploads and /report passthrough/]
  end

  subgraph Backend[Backend: FastAPI backend/]
    Main[backend/main.py\nFastAPI app + route handlers]
    AuthRoutes[/auth/verify\n/auth/register\n/auth/disable-account/]
    DiagnoseRoute[/diagnose\n/diagnose/usage\n/report/]
    FirebaseSvc[services/firebase_svc.py\nAuth, Firestore, storage, cache]
    LLMFallback[services/llm_svc.py\nGemini / OpenRouter / HuggingFace]
    GraphBuilder[model/graph.py\nLangGraph workflow]
  end

  subgraph Pipeline[Explainability pipeline]
    A[vision_analysis]
    B[generate_heatmap]
    C[retrieve_medical_context]
    D[generate_explanation]
    E[generate_pdf_report]
  end

  subgraph External[External services]
    Firebase[Firebase Auth + Firestore + Storage]
    Gemini[Gemini API]
    OpenRouter[OpenRouter API]
    HuggingFace[HuggingFace Inference API]
  end

  User --> Nginx
  Nginx --> Landing
  Nginx --> Home
  Nginx --> Diagnose
  Nginx --> Login
  Nginx --> Register
  Nginx --> Profile
  Nginx --> DiseaseInfo
  Nginx --> Wellness
  Nginx --> Communication

  Landing --> Login
  Landing --> Register
  Landing --> Home
  Home --> Diagnose
  Home --> DiseaseInfo
  Diagnose --> UploadPanel
  Diagnose --> ResultPanel
  Diagnose --> HeatmapViewer
  Login --> Config
  Register --> Config
  Profile --> Config
  UploadPanel --> Config
  ResultPanel --> Config
  HeatmapViewer --> Config

  Config --> APIProxy
  APIProxy --> Main
  Main --> AuthRoutes
  Main --> DiagnoseRoute
  Main --> GraphBuilder
  Main --> FirebaseSvc
  Main --> AssetProxy

  AuthRoutes --> Firebase
  FirebaseSvc --> Firebase
  DiagnoseRoute --> GraphBuilder
  GraphBuilder --> A --> B --> C --> D --> E
  A --> LLMFallback
  C --> Firebase
  D --> LLMFallback
  LLMFallback --> Gemini
  LLMFallback --> OpenRouter
  LLMFallback --> HuggingFace

  B --> Firebase
  E --> Firebase
  DiagnoseRoute --> AssetProxy
  AssetProxy --> ResultPanel
  AssetProxy --> HeatmapViewer
```

## Key Flows

1. The landing page routes users into login, register, or the authenticated home flow.
2. The diagnosis screen sends an image and symptoms to `/api/diagnose` with a Firebase bearer token.
3. The backend validates, rate-limits, caches, and then runs the LangGraph pipeline.
4. The pipeline produces the diagnosis, heatmap, medical context, explanation, and report asset.
5. Nginx serves the static frontend and forwards `/api`, `/uploads`, and `/report` to FastAPI.

## Most Important Files

- [frontend/app/page.tsx](frontend/app/page.tsx)
- [frontend/app/diagnose/page.tsx](frontend/app/diagnose/page.tsx)
- [frontend/app/components/UploadPanel.tsx](frontend/app/components/UploadPanel.tsx)
- [frontend/app/components/ResultPanel.tsx](frontend/app/components/ResultPanel.tsx)
- [frontend/app/config.ts](frontend/app/config.ts)
- [backend/main.py](backend/main.py)
- [model/graph.py](model/graph.py)
- [model/nodes.py](model/nodes.py)
- [backend/services/llm_svc.py](backend/services/llm_svc.py)
- [Dockerfile](Dockerfile)
- [hf/nginx.conf](hf/nginx.conf)
