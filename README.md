# Legal Document Analyzer

Upload a legal document (PDF) and receive an AI-powered analysis that extracts:
- Parties Involved
- Jurisdiction / Court Info
- Key Legal Issues
- Verdict / Summary (in plain English)
- High-priority Risks (e.g. Uncapped Liability, Missing Indemnification)

🔧 **Powered by:** LangChain, FastAPI, Next.js, and Groq (Llama 3). 
*Note: SQLite is used by default for local development.*

---

## 📋 Quick Setup (For Agents / Developers)

Clone, set up, and run the project locally with these steps:

**1. Clone the Repository**
```bash
git clone https://github.com/SharpKushagra/legal-doc-analyzer.git
cd legal-doc-analyzer
```

**2. Set Up the Backend Environment**
- Create and activate a new virtual environment:
  - **Windows**: `python -m venv venv` and `venv\Scripts\activate`
  - **Mac/Linux**: `python3 -m venv venv` and `source venv/bin/activate`
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Environment Variables: 
  Create a `.env` file in the root directory and ensure it has a valid Groq API Key:
  `GROQ_API_KEY=your_key_here`

**3. Start the Backend API Server**
- Run `python api.py` in the root directory. 
- Ensure it successfully starts Uvicorn on `http://localhost:8000` or `0.0.0.0:8000`. Leave this running in the background.

**4. Set Up & Start the Frontend**
Open a second terminal window (keep the backend running) and execute:
```bash
cd frontend
npm install
npm run dev
```
- Ensure Next.js spins up properly on `http://localhost:3000`.

**5. Verification**
Confirm the application is functioning fully by opening `http://localhost:3000` in your browser. From there, you can sign up, log in, and begin uploading PDF documents for analysis.
