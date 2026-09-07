const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


const interviewReportSchema = {
    type: Type.OBJECT,

    properties: {

        matchScore: {
            type: Type.NUMBER,
            description:
                "Match score between the candidate and job description from 0 to 100."
        },

        technicalQuestions: {
            type: Type.ARRAY,

            description:
                "Technical interview questions specifically based on the candidate resume and job description.",

            items: {
                type: Type.OBJECT,

                properties: {

                    question: {
                        type: Type.STRING,
                        description:
                            "A technical interview question relevant to the candidate."
                    },

                    intention: {
                        type: Type.STRING,
                        description:
                            "What the interviewer wants to evaluate with this question."
                    },

                    answer: {
                        type: Type.STRING,
                        description:
                            "A detailed sample answer explaining what the candidate should say."
                    }

                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        behavioralQuestions: {
            type: Type.ARRAY,

            description:
                "Behavioral interview questions relevant to the candidate.",

            items: {
                type: Type.OBJECT,

                properties: {

                    question: {
                        type: Type.STRING,
                        description:
                            "A behavioral interview question."
                    },

                    intention: {
                        type: Type.STRING,
                        description:
                            "What the interviewer wants to evaluate."
                    },

                    answer: {
                        type: Type.STRING,
                        description:
                            "A strong sample answer using the STAR method where appropriate."
                    }

                },

                required: [
                    "question",
                    "intention",
                    "answer"
                ]
            }
        },

        skillGaps: {
            type: Type.ARRAY,

            description:
                "Skills that the candidate lacks or needs to improve for the job.",

            items: {
                type: Type.OBJECT,

                properties: {

                    skill: {
                        type: Type.STRING,
                        description:
                            "The missing or weak skill."
                    },

                    severity: {
                        type: Type.STRING,

                        enum: [
                            "low",
                            "medium",
                            "high"
                        ],

                        description:
                            "Severity of the skill gap."
                    }

                },

                required: [
                    "skill",
                    "severity"
                ]
            }
        },

        preparationPlan: {
            type: Type.ARRAY,

            description:
                "A seven-day interview preparation plan.",

            items: {
                type: Type.OBJECT,

                properties: {

                    day: {
                        type: Type.NUMBER,
                        description:
                            "Preparation day number."
                    },

                    focus: {
                        type: Type.STRING,
                        description:
                            "Main topic or focus for the day."
                    },

                    tasks: {
                        type: Type.ARRAY,

                        items: {
                            type: Type.STRING
                        },

                        description:
                            "Tasks the candidate should complete."
                    }

                },

                required: [
                    "day",
                    "focus",
                    "tasks"
                ]
            }
        }

    },

    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan"
    ]
};


async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
You are an expert technical interviewer and career coach.

Analyze the candidate's resume, self-description and job description.

========================
RESUME
========================

${resume || "No resume provided."}


========================
SELF DESCRIPTION
========================

${selfDescription || "No self description provided."}


========================
JOB DESCRIPTION
========================

${jobDescription}


========================
TASK
========================

Generate a detailed interview preparation report.

IMPORTANT:

Generate EXACTLY:

- 8 technical interview questions
- 5 behavioral interview questions
- 4 skill gaps
- 7 days of preparation plan

Every technical question MUST contain:

question
intention
answer

Every behavioral question MUST contain:

question
intention
answer

Every skill gap MUST contain:

skill
severity

Every preparation day MUST contain:

day
focus
tasks


TECHNICAL QUESTIONS

Make technical questions specific to:

- Technologies in the resume
- Technologies in the job description
- Candidate projects
- Candidate work experience
- Backend development
- Frontend development
- Databases
- APIs
- Authentication
- System design where appropriate

Do NOT generate generic questions if the resume provides enough information.


BEHAVIORAL QUESTIONS

Make questions relevant to the candidate's:

- Work experience
- Projects
- Collaboration
- Problem solving
- Challenges
- Leadership
- Communication

Use the STAR approach in the sample answers.


SKILL GAPS

Compare the candidate's skills against the job requirements.

Only identify realistic skill gaps.


PREPARATION PLAN

Create a practical 7-day preparation plan based on the identified skill gaps
and the technologies required by the job.


CRITICAL:

Do not return null values.

Do not return empty objects.

Do not return null inside arrays.

Every array item must be a complete object with all required fields.
`;


    try {

        const response = await ai.models.generateContent({

            model: "gemini-3.8-flash",

            contents: prompt,

            config: {

                responseMimeType: "application/json",

                responseJsonSchema:
                    interviewReportSchema

            }

        });


        console.log(
            "RAW GEMINI RESPONSE:",
            response.text
        );


        const result =
            JSON.parse(response.text);


        // Extra validation
        if (
            !Array.isArray(
                result.technicalQuestions
            )
        ) {
            throw new Error(
                "technicalQuestions is not an array"
            );
        }


        if (
            !Array.isArray(
                result.behavioralQuestions
            )
        ) {
            throw new Error(
                "behavioralQuestions is not an array"
            );
        }


        if (
            !Array.isArray(
                result.skillGaps
            )
        ) {
            throw new Error(
                "skillGaps is not an array"
            );
        }


        if (
            !Array.isArray(
                result.preparationPlan
            )
        ) {
            throw new Error(
                "preparationPlan is not an array"
            );
        }


        // Make sure Gemini didn't return null
        if (
            result.technicalQuestions.some(
                item => item === null
            )
        ) {
            throw new Error(
                "Gemini returned null technical questions"
            );
        }


        if (
            result.behavioralQuestions.some(
                item => item === null
            )
        ) {
            throw new Error(
                "Gemini returned null behavioral questions"
            );
        }


        if (
            result.skillGaps.some(
                item => item === null
            )
        ) {
            throw new Error(
                "Gemini returned null skill gaps"
            );
        }


        if (
            result.preparationPlan.some(
                item => item === null
            )
        ) {
            throw new Error(
                "Gemini returned null preparation plan"
            );
        }


        console.log(
            "Technical Questions:",
            result.technicalQuestions.length
        );

        console.log(
            "Behavioral Questions:",
            result.behavioralQuestions.length
        );

        console.log(
            "Skill Gaps:",
            result.skillGaps.length
        );

        console.log(
            "Preparation Days:",
            result.preparationPlan.length
        );


        return result;

    } catch (error) {

        console.error(
            "Gemini generation error:",
            error
        );

        throw error;
    }
}


module.exports = {
    generateInterviewReport
};
