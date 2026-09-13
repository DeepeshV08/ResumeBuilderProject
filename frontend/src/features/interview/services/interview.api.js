import axios from "axios";

const api = axios.create({
    baseURL: "https://resumebuilderproject-w9zi.onrender.com",
    withCredentials: true,
});


/**
 * @description
 * Service to generate an interview report based on
 * job title, job description, self description and resume.
 */
export const generateInterviewReport = async ({
    title,
    jobDescription,
    selfDescription,
    resumeFile
}) => {

    const formData = new FormData();

    // Job title
    formData.append("title", title);

    // Job description
    formData.append("jobDescription", jobDescription);

    // Self description
    if (selfDescription) {
        formData.append("selfDescription", selfDescription);
    }

    // Resume PDF
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }


    const response = await api.post(
        "/api/interview/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );


    return response.data;
};


/**
 * @description
 * Service to get an interview report by interviewId.
 */
export const getInterviewReportById = async (interviewId) => {

    const response = await api.get(
        `/api/interview/report/${interviewId}`
    );

    return response.data;
};


/**
 * @description
 * Service to get all interview reports of the logged-in user.
 */
export const getAllInterviewReports = async () => {

    const response = await api.get(
        "/api/interview/"
    );

    return response.data;
};


/**
 * @description
 * Service to generate a resume PDF based on
 * the interview report.
 */
export const generateResumePdf = async ({
    interviewReportId
}) => {

    const response = await api.post(
        `/api/interview/resume/pdf/${interviewReportId}`,
        null,
        {
            responseType: "blob"
        }
    );

    return response.data;
};
