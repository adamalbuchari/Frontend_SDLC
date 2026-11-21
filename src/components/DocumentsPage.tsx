import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Badge, Icon } from "./ui";

const API = "http://localhost:5100";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

type Project = {
  projectId: string;
  projectCode?: string;
  projectName?: string;
};

type Requirement = {
  projectDocumentRequirementId: string;
  documentName: string;
  documentTypeId: string;
  sdlPhaseId: string;
  isRequired: boolean;
};

type UserOption = {
  userId: string;
  fullName: string;
  email?: string;
};

type DocumentRow = {
  documentId: string;
  projectId: string;
  documentTitle: string;
  description?: string;
  currentVersionNo: number;
  status: string;
  approvalStatus: string;
  createdDt?: string;
  sdlPhaseName?: string;
  phaseName?: string;
  documentTypeName?: string;
  documentTypeId?: string;
  documentOwnerId?: string;
};

type VersionRow = {
  documentVersionId: string;
  versionNo: number;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  changeDescription?: string;
  uploadedBy: string;
  uploadedDt: string;
};

type UploadOptions = {
  requirements: Requirement[];
  users: UserOption[];
};

type UploadForm = {
  projectId: string;
  projectDocumentRequirementId: string;
  documentTypeId: string;
  sdlPhaseId: string;
  documentOwnerId: string;
  documentTitle: string;
  description: string;
  changeDescription: string;
  file: File | null;
};

type WorkflowStage = {
  approvalWorkflowStageId: string;
  stageName: string;
  stageType: string;
  sequenceNo: number;
  isRequired: boolean;
  approvalMode: string;
  approvalRule: string;
};

type WorkflowOption = {
  approvalWorkflowId: string;
  workflowName: string;
  stages: WorkflowStage[];
};

type WorkflowConfiguration = {
  workflows: WorkflowOption[];
  reviewerUsers: UserOption[];
  approverUsers: UserOption[];
};

type WorkflowHistory = {
  documentWorkflowHistoryId?: string;
  action?: string;
  actionByName?: string;
  comment?: string;
  createdDt?: string;
  createdAt?: string;
  oldStatus?: string;
  newStatus?: string;
};

function getValue<T>(
  item: Record<string, unknown>,
  camel: string,
  pascal?: string,
): T | undefined {
  return (item[camel] ?? item[pascal ?? camel]) as T | undefined;
}

function unwrapList<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];

  if (result && typeof result === "object") {
    const data = result as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items as T[];
    if (Array.isArray(data.data)) return data.data as T[];
    if (Array.isArray(data.results)) return data.results as T[];
  }

  return [];
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return (
      body.message ??
      body.title ??
      body.detail ??
      body.errors?.[0]?.description ??
      `Request gagal (${response.status}).`
    );
  } catch {
    return `Request gagal (${response.status}).`;
  }
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status: string) {
  const value = (status ?? "").toLowerCase();

  if (value.includes("approved") || value.includes("complete")) return "green";
  if (value.includes("reject") || value.includes("revision")) return "red";
  if (value.includes("review") || value.includes("submitted")) return "blue";
  if (value.includes("draft") || value.includes("pending")) return "amber";

  return "neutral";
}

const initialForm: UploadForm = {
  projectId: "",
  projectDocumentRequirementId: "",
  documentTypeId: "",
  sdlPhaseId: "",
  documentOwnerId: "",
  documentTitle: "",
  description: "",
  changeDescription: "",
  file: null,
};

export default function DocumentsPage() {
  const token = sessionStorage.getItem("docuflow_token");

  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [options, setOptions] = useState<UploadOptions>({
    requirements: [],
    users: [],
  });
  const [form, setForm] = useState<UploadForm>(initialForm);

  const [showVersions, setShowVersions] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRow | null>(
    null,
  );
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  const [showNewVersion, setShowNewVersion] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [changeDescription, setChangeDescription] = useState("");
  const [uploadingVersion, setUploadingVersion] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailHistory, setDetailHistory] = useState<WorkflowHistory[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showSubmit, setShowSubmit] = useState(false);
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);
  const [configuration, setConfiguration] = useState<WorkflowConfiguration>({
    workflows: [],
    reviewerUsers: [],
    approverUsers: [],
  });
  const [workflowId, setWorkflowId] = useState("");
  const [reviewerAssignments, setReviewerAssignments] = useState<
    Record<string, string>
  >({});
  const [approverAssignments, setApproverAssignments] = useState<
    Record<string, string>
  >({});
  const [workflowComment, setWorkflowComment] = useState("");
  const [workflowDueDate, setWorkflowDueDate] = useState("");

  const authHeaders = useCallback(
    (): HeadersInit => ({
      Authorization: `Bearer ${token ?? ""}`,
    }),
    [token],
  );

  const loadProjects = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/projects`, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const rows = unwrapList<Record<string, unknown>>(await response.json());
      setProjects(
        rows
          .map((item) => ({
            projectId: getValue<string>(item, "projectId", "ProjectId") ?? "",
            projectCode: getValue<string>(item, "projectCode", "ProjectCode"),
            projectName: getValue<string>(item, "projectName", "ProjectName"),
          }))
          .filter((item) => item.projectId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat project.");
    }
  }, [authHeaders]);

  const loadDocuments = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: "1", pageSize: "100" });
      if (search.trim()) params.set("search", search.trim());
      if (projectFilter) params.set("projectId", projectFilter);

      const response = await fetch(
        `${API}/api/documents?${params.toString()}`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const rows = unwrapList<Record<string, unknown>>(await response.json());

      setDocuments(
        rows
          .map((item) => ({
            documentId:
              getValue<string>(item, "documentId", "DocumentId") ?? "",
            projectId: getValue<string>(item, "projectId", "ProjectId") ?? "",
            documentTitle:
              getValue<string>(item, "documentTitle", "DocumentTitle") ?? "",
            description: getValue<string>(item, "description", "Description"),
            currentVersionNo:
              getValue<number>(item, "currentVersionNo", "CurrentVersionNo") ??
              1,
            status: getValue<string>(item, "status", "Status") ?? "Draft",
            approvalStatus:
              getValue<string>(item, "approvalStatus", "ApprovalStatus") ??
              "Not Submitted",
            createdDt: getValue<string>(item, "createdDt", "CreatedDt"),
            sdlPhaseName:
              getValue<string>(item, "sdlPhaseName", "SDLPhaseName") ??
              getValue<string>(item, "phaseName", "PhaseName"),
            phaseName: getValue<string>(item, "phaseName", "PhaseName"),
            documentTypeName: getValue<string>(
              item,
              "documentTypeName",
              "DocumentTypeName",
            ),
            documentTypeId: getValue<string>(
              item,
              "documentTypeId",
              "DocumentTypeId",
            ),
            documentOwnerId: getValue<string>(
              item,
              "documentOwnerId",
              "DocumentOwnerId",
            ),
          }))
          .filter((item) => item.documentId),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dokumen.");
    } finally {
      setLoading(false);
    }
  }, [token, search, projectFilter, authHeaders]);

  useEffect(() => {
    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }
    void loadProjects();
  }, [token, loadProjects]);

  useEffect(() => {
    if (token) void loadDocuments();
  }, [token, loadDocuments]);

  const loadUploadOptions = async (projectId: string) => {
    const response = await fetch(
      `${API}/api/documents/upload-options?projectId=${encodeURIComponent(projectId)}`,
      { headers: authHeaders() },
    );
    if (!response.ok) throw new Error(await getErrorMessage(response));

    const result = await response.json();
    const data = result.data ?? result;

    const requirementRows = unwrapList<Record<string, unknown>>(
      data.requirements ?? data.Requirements,
    );
    const userRows = unwrapList<Record<string, unknown>>(
      data.users ?? data.Users,
    );

    setOptions({
      requirements: requirementRows.map((item) => ({
        projectDocumentRequirementId:
          getValue<string>(
            item,
            "projectDocumentRequirementId",
            "ProjectDocumentRequirementId",
          ) ?? "",
        documentName:
          getValue<string>(item, "documentName", "DocumentName") ?? "",
        documentTypeId:
          getValue<string>(item, "documentTypeId", "DocumentTypeId") ?? "",
        sdlPhaseId: getValue<string>(item, "sdlPhaseId", "SDLPhaseId") ?? "",
        isRequired:
          getValue<boolean>(item, "isRequired", "IsRequired") ?? false,
      })),
      users: userRows.map((item) => ({
        userId: getValue<string>(item, "userId", "UserId") ?? "",
        fullName: getValue<string>(item, "fullName", "FullName") ?? "",
        email: getValue<string>(item, "email", "Email"),
      })),
    });
  };

  const openUpload = async () => {
    setError("");
    setSuccess("");

    if (!projects.length) {
      setError("Belum ada project yang tersedia.");
      return;
    }

    const projectId = projectFilter || projects[0].projectId;
    setForm({ ...initialForm, projectId });

    try {
      await loadUploadOptions(projectId);
      setShowUpload(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat pilihan upload.",
      );
    }
  };

  const changeProject = async (projectId: string) => {
    setForm((current) => ({
      ...current,
      projectId,
      projectDocumentRequirementId: "",
      documentTypeId: "",
      sdlPhaseId: "",
      documentTitle: "",
      documentOwnerId: "",
    }));
    setOptions({ requirements: [], users: [] });

    if (!projectId) return;

    try {
      await loadUploadOptions(projectId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat requirement.",
      );
    }
  };

  const changeRequirement = (requirementId: string) => {
    const requirement = options.requirements.find(
      (item) => item.projectDocumentRequirementId === requirementId,
    );

    setForm((current) => ({
      ...current,
      projectDocumentRequirementId: requirementId,
      documentTypeId: requirement?.documentTypeId ?? "",
      sdlPhaseId: requirement?.sdlPhaseId ?? "",
      documentTitle: requirement?.documentName ?? "",
    }));
  };

  const submitUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.file) return setError("Silakan pilih file dokumen.");
    if (form.file.size > MAX_FILE_SIZE)
      return setError("Ukuran file maksimal 20 MB.");

    if (
      !form.projectId ||
      !form.projectDocumentRequirementId ||
      !form.documentTypeId ||
      !form.sdlPhaseId ||
      !form.documentOwnerId ||
      !form.documentTitle.trim()
    ) {
      return setError("Lengkapi seluruh input wajib pada formulir.");
    }

    const allowed = [".pdf", ".docx", ".xlsx", ".pptx"];
    if (!allowed.some((ext) => form.file!.name.toLowerCase().endsWith(ext))) {
      return setError("Format file harus PDF, DOCX, XLSX, atau PPTX.");
    }

    const body = new FormData();
    body.append("ProjectId", form.projectId);
    body.append(
      "ProjectDocumentRequirementId",
      form.projectDocumentRequirementId,
    );
    body.append("DocumentTypeId", form.documentTypeId);
    body.append("SDLPhaseId", form.sdlPhaseId);
    body.append("DocumentOwnerId", form.documentOwnerId);
    body.append("DocumentTitle", form.documentTitle.trim());
    body.append("Description", form.description);
    body.append("ChangeDescription", form.changeDescription);
    body.append("File", form.file);

    setUploading(true);
    try {
      const response = await fetch(`${API}/api/documents/upload`, {
        method: "POST",
        headers: authHeaders(),
        body,
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));

      setShowUpload(false);
      setForm(initialForm);
      setSuccess("Dokumen berhasil di-upload.");
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload dokumen gagal.");
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async (documentId: string) => {
    setError("");
    try {
      const response = await fetch(
        `${API}/api/documents/${documentId}/download`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download =
        documents.find((item) => item.documentId === documentId)
          ?.documentTitle || "document";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download dokumen gagal.");
    }
  };

  const openVersionHistory = async (document: DocumentRow) => {
    setError("");
    setSuccess("");
    setSelectedDocument(document);
    setVersions([]);
    setLoadingVersions(true);
    setShowVersions(true);

    try {
      const response = await fetch(
        `${API}/api/documents/${document.documentId}`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const result = await response.json();
      const data = result.data ?? result;
      // Backend mengirim { success, data: dokumen, versions: [...] }:
      // "versions" berada sejajar dengan "data", bukan di dalamnya.
      const rawVersions =
        result.versions ??
        result.Versions ??
        data.versions ??
        data.Versions ??
        [];
      const rows = rawVersions.map((item: Record<string, unknown>) => ({
        documentVersionId:
          getValue<string>(item, "documentVersionId", "DocumentVersionId") ??
          "",
        versionNo: getValue<number>(item, "versionNo", "VersionNo") ?? 1,
        originalFileName:
          getValue<string>(item, "originalFileName", "OriginalFileName") ?? "",
        contentType: getValue<string>(item, "contentType", "ContentType") ?? "",
        fileSize: getValue<number>(item, "fileSize", "FileSize") ?? 0,
        changeDescription: getValue<string>(
          item,
          "changeDescription",
          "ChangeDescription",
        ),
        uploadedBy: getValue<string>(item, "uploadedBy", "UploadedBy") ?? "",
        uploadedDt: getValue<string>(item, "uploadedDt", "UploadedDt") ?? "",
      }));
      setVersions(rows);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat riwayat versi.",
      );
      setShowVersions(false);
    } finally {
      setLoadingVersions(false);
    }
  };

  const submitNewVersion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedDocument || !newVersionFile) {
      return setError("Pilih file untuk versi baru.");
    }
    if (newVersionFile.size > MAX_FILE_SIZE) {
      return setError("Ukuran file maksimal 20 MB.");
    }

    const allowed = [".pdf", ".docx", ".xlsx", ".pptx"];
    if (
      !allowed.some((ext) => newVersionFile.name.toLowerCase().endsWith(ext))
    ) {
      return setError("Format file harus PDF, DOCX, XLSX, atau PPTX.");
    }

    const body = new FormData();
    body.append("File", newVersionFile);
    body.append("ChangeDescription", changeDescription);

    setUploadingVersion(true);
    try {
      const response = await fetch(
        `${API}/api/documents/${selectedDocument.documentId}/versions`,
        { method: "POST", headers: authHeaders(), body },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      setShowNewVersion(false);
      setNewVersionFile(null);
      setChangeDescription("");
      setSuccess("Versi dokumen baru berhasil di-upload.");
      await loadDocuments();
      await openVersionHistory({
        ...selectedDocument,
        currentVersionNo: selectedDocument.currentVersionNo + 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload versi baru gagal.");
    } finally {
      setUploadingVersion(false);
    }
  };

  const downloadVersion = async (
    documentId: string,
    versionNo: number,
    fileName: string,
  ) => {
    setError("");
    try {
      const response = await fetch(
        `${API}/api/documents/${documentId}/versions/${versionNo}/download`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName || `document-v${versionNo}`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download versi gagal.");
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?"))
      return;

    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API}/api/documents/${documentId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error(await getErrorMessage(response));

      setSuccess("Dokumen berhasil dihapus.");
      await loadDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus dokumen.");
    }
  };

  const openDocumentDetail = async (document: DocumentRow) => {
    setSelectedDocument(document);
    setDetailHistory([]);
    setShowDetail(true);
    setLoadingDetail(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/api/review-approvals/documents/${document.documentId}/history`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const result = await response.json();
      const rows = unwrapList<Record<string, unknown>>(result.data ?? result);

      setDetailHistory(
        rows.map((item) => ({
          documentWorkflowHistoryId: getValue<string>(
            item,
            "documentWorkflowHistoryId",
            "DocumentWorkflowHistoryId",
          ),
          action: getValue<string>(item, "action", "Action"),
          actionByName:
            getValue<string>(item, "actionByName", "ActionByName") ??
            getValue<string>(item, "actorName", "ActorName"),
          comment: getValue<string>(item, "comment", "Comment"),
          createdDt:
            getValue<string>(item, "createdDt", "CreatedDt") ??
            getValue<string>(item, "createdAt", "CreatedAt") ??
            getValue<string>(item, "actionAt", "ActionAt"),
          oldStatus:
            getValue<string>(item, "oldStatus", "OldStatus") ??
            getValue<string>(item, "previousStatus", "PreviousStatus"),
          newStatus: getValue<string>(item, "newStatus", "NewStatus"),
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat riwayat workflow.",
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const openSubmitWorkflow = async () => {
    if (!selectedDocument) return;

    setError("");
    setWorkflowId("");
    setReviewerAssignments({});
    setApproverAssignments({});
    setWorkflowComment("");
    setWorkflowDueDate("");
    setConfiguration({
      workflows: [],
      reviewerUsers: [],
      approverUsers: [],
    });
    setLoadingConfiguration(true);

    try {
      const params = new URLSearchParams({
        projectId: selectedDocument.projectId,
      });
      if (selectedDocument.documentTypeId) {
        params.set("documentTypeId", selectedDocument.documentTypeId);
      }

      const response = await fetch(
        `${API}/api/review-approvals/configuration?${params.toString()}`,
        { headers: authHeaders() },
      );
      if (!response.ok) throw new Error(await getErrorMessage(response));

      const result = await response.json();
      const data = result.data ?? result;

      const workflows = unwrapList<Record<string, unknown>>(
        data.workflows ?? data.Workflows,
      ).map((item) => {
        const stages = unwrapList<Record<string, unknown>>(
          item.stages ?? item.Stages,
        ).map((stage) => ({
          approvalWorkflowStageId:
            getValue<string>(
              stage,
              "approvalWorkflowStageId",
              "ApprovalWorkflowStageId",
            ) ?? "",
          stageName: getValue<string>(stage, "stageName", "StageName") ?? "",
          stageType: getValue<string>(stage, "stageType", "StageType") ?? "",
          sequenceNo: getValue<number>(stage, "sequenceNo", "SequenceNo") ?? 0,
          isRequired:
            getValue<boolean>(stage, "isRequired", "IsRequired") ?? true,
          approvalMode:
            getValue<string>(stage, "approvalMode", "ApprovalMode") ??
            "Sequential",
          approvalRule:
            getValue<string>(stage, "approvalRule", "ApprovalRule") ?? "All",
        }));

        return {
          approvalWorkflowId:
            getValue<string>(
              item,
              "approvalWorkflowId",
              "ApprovalWorkflowId",
            ) ?? "",
          workflowName:
            getValue<string>(item, "workflowName", "WorkflowName") ?? "",
          stages: stages.sort((a, b) => a.sequenceNo - b.sequenceNo),
        };
      });

      const mapUsers = (items: unknown): UserOption[] =>
        unwrapList<Record<string, unknown>>(items).map((item) => ({
          userId: getValue<string>(item, "userId", "UserId") ?? "",
          fullName: getValue<string>(item, "fullName", "FullName") ?? "",
          email: getValue<string>(item, "email", "Email"),
        }));

      setConfiguration({
        workflows,
        // Backend mengirim "reviewers" dan "approvers".
        reviewerUsers: mapUsers(
          data.reviewers ??
            data.Reviewers ??
            data.reviewerUsers ??
            data.ReviewerUsers,
        ),
        approverUsers: mapUsers(
          data.approvers ??
            data.Approvers ??
            data.approverUsers ??
            data.ApproverUsers,
        ),
      });

      if (workflows.length) setWorkflowId(workflows[0].approvalWorkflowId);
      setShowSubmit(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat konfigurasi workflow.",
      );
    } finally {
      setLoadingConfiguration(false);
    }
  };

  const selectedWorkflow = configuration.workflows.find(
    (item) => item.approvalWorkflowId === workflowId,
  );

  const submitForReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDocument || !selectedWorkflow) {
      setError("Pilih workflow terlebih dahulu.");
      return;
    }

    const assignments: {
      approvalWorkflowStageId: string;
      assignedUserId: string;
      assignmentType: string;
      dueDate?: string;
    }[] = [];

    for (const stage of selectedWorkflow.stages) {
      const isReview = stage.stageType.toLowerCase() === "review";
      const assignedUserId = isReview
        ? reviewerAssignments[stage.approvalWorkflowStageId]
        : approverAssignments[stage.approvalWorkflowStageId];

      if (stage.isRequired && !assignedUserId) {
        setError(
          `Pilih ${isReview ? "Reviewer" : "Approver"} untuk tahap ${stage.stageName}.`,
        );
        return;
      }

      if (assignedUserId) {
        assignments.push({
          approvalWorkflowStageId: stage.approvalWorkflowStageId,
          assignedUserId,
          assignmentType: isReview ? "Reviewer" : "Approver",
          ...(workflowDueDate
            ? { dueDate: new Date(workflowDueDate).toISOString() }
            : {}),
        });
      }
    }

    if (!assignments.length) {
      setError("Minimal satu Reviewer atau Approver harus dipilih.");
      return;
    }

    setSubmittingWorkflow(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/review-approvals/submit`, {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: selectedDocument.documentId,
          approvalWorkflowId: selectedWorkflow.approvalWorkflowId,
          dueDate: workflowDueDate
            ? new Date(workflowDueDate).toISOString()
            : null,
          comment: workflowComment || null,
          assignments,
        }),
      });

      if (!response.ok) throw new Error(await getErrorMessage(response));

      setShowSubmit(false);
      setShowDetail(false);
      setSuccess("Dokumen berhasil dikirim untuk proses review.");
      await loadDocuments();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim dokumen untuk review.",
      );
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  const closeUpload = () => {
    if (uploading) return;
    setShowUpload(false);
    setForm(initialForm);
  };

  const projectName = (projectId: string) => {
    const project = projects.find((item) => item.projectId === projectId);
    return project?.projectName ?? project?.projectCode ?? "-";
  };

  const projectLabel = (project: Project) =>
    project.projectCode
      ? `${project.projectCode} - ${project.projectName ?? ""}`
      : (project.projectName ?? project.projectId);

  return (
    <div className="page list-page documents-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">DOCUMENT REPOSITORY</span>
          <h1>Documents</h1>
          <p>Temukan dan kelola seluruh dokumen SDLC dalam satu tempat.</p>
        </div>
        <button type="button" className="btn primary" onClick={openUpload}>
          <Icon name="upload" />
          Upload dokumen
        </button>
      </section>

      <section className="module-feature">
        <div className="module-feature-icon">
          <Icon name="file" size={25} />
        </div>
        <div>
          <span>Ringkasan hari ini</span>
          <strong>{documents.length} dokumen tercatat di repository</strong>
        </div>
        <button type="button" className="text-link">
          Lihat insight <Icon name="arrow" size={15} />
        </button>
      </section>

      {error && <div className="documents-message error">{error}</div>}
      {success && <div className="documents-message success">{success}</div>}

      <section className="panel table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Icon name="search" size={16} />
            <input
              type="text"
              placeholder="Cari di documents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void loadDocuments();
              }}
            />
          </label>

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
          >
            <option value="">Semua Proyek</option>
            {projects.map((project) => (
              <option key={project.projectId} value={project.projectId}>
                {projectLabel(project)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn secondary small"
            onClick={() => void loadDocuments()}
            disabled={loading}
          >
            <Icon name="search" /> Cari
          </button>

          <button
            type="button"
            className="btn secondary small"
            onClick={() => {
              setSearch("");
              setProjectFilter("");
            }}
          >
            <Icon name="filter" /> Reset
          </button>
        </div>

        <div className="data-table-wrap">
          <table className="data-table module-table documents-table">
            <thead>
              <tr>
                <th>NAMA DOKUMEN</th>
                <th>PROYEK</th>
                <th>FASE SDLC</th>
                <th>VERSI</th>
                <th>STATUS</th>
                <th>APPROVAL</th>
                <th>DIBUAT</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.documentId}>
                  <td>
                    <div className="project-cell">
                      <div className="file-tile blue">
                        <Icon name="file" />
                      </div>
                      <div>
                        <strong>{document.documentTitle}</strong>
                        {document.description && (
                          <span>{document.description}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{projectName(document.projectId)}</td>
                  <td>{document.sdlPhaseName ?? document.phaseName ?? "-"}</td>
                  <td>v{document.currentVersionNo}</td>
                  <td>
                    <Badge tone={statusTone(document.status)}>
                      {document.status}
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={statusTone(document.approvalStatus)}>
                      {document.approvalStatus}
                    </Badge>
                  </td>
                  <td>{formatDate(document.createdDt)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-btn"
                        title="Detail dokumen dan workflow"
                        aria-label="Detail dokumen"
                        onClick={() => void openDocumentDetail(document)}
                      >
                        <Icon name="eye" />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Download dokumen"
                        aria-label="Download dokumen"
                        onClick={() =>
                          void downloadDocument(document.documentId)
                        }
                      >
                        <Icon name="download" />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Riwayat versi"
                        aria-label="Riwayat versi"
                        onClick={() => void openVersionHistory(document)}
                      >
                        <Icon name="clock" />
                      </button>
                      <button
                        type="button"
                        className="btn secondary small danger"
                        onClick={() => void deleteDocument(document.documentId)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="empty-state">
              <strong>Memuat data dokumen...</strong>
            </div>
          )}
          {!loading && documents.length === 0 && (
            <div className="empty-state">
              <Icon name="file" size={28} />
              <strong>Belum ada dokumen</strong>
              <span>Dokumen yang di-upload akan ditampilkan di sini.</span>
            </div>
          )}
        </div>

        <div className="pagination">
          <span>Menampilkan {documents.length} dokumen</span>
          <div>
            <button disabled>‹</button>
            <button className="current">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </section>

      {showDetail && selectedDocument && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Detail dokumen"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Tutup detail"
            onClick={() => setShowDetail(false)}
          />
          <div className="modal wide">
            <div className="modal-header">
              <div>
                <span className="eyebrow">DOCUMENT DETAILS</span>
                <h2>{selectedDocument.documentTitle}</h2>
                <p>{projectName(selectedDocument.projectId)}</p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowDetail(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <dl className="detail-list modal-detail">
              <div>
                <dt>Status dokumen</dt>
                <dd>
                  <Badge tone={statusTone(selectedDocument.status)}>
                    {selectedDocument.status}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt>Status approval</dt>
                <dd>
                  <Badge tone={statusTone(selectedDocument.approvalStatus)}>
                    {selectedDocument.approvalStatus}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt>Versi saat ini</dt>
                <dd>v{selectedDocument.currentVersionNo}</dd>
              </div>
              <div>
                <dt>Fase SDLC</dt>
                <dd>
                  {selectedDocument.sdlPhaseName ??
                    selectedDocument.phaseName ??
                    "-"}
                </dd>
              </div>
              <div className="span-2">
                <dt>Deskripsi</dt>
                <dd>{selectedDocument.description || "-"}</dd>
              </div>
            </dl>

            <div className="modal-toolbar">
              {["Draft", "Revision Required"].includes(
                selectedDocument.status,
              ) && (
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => void openSubmitWorkflow()}
                  disabled={loadingConfiguration}
                >
                  {loadingConfiguration
                    ? "Memuat workflow..."
                    : "Submit for Review"}
                </button>
              )}
              <button
                type="button"
                className="btn secondary"
                onClick={() => void openVersionHistory(selectedDocument)}
              >
                <Icon name="clock" /> Riwayat versi
              </button>
            </div>

            <div className="section-heading">
              <h3>Review & Approval History</h3>
            </div>
            {loadingDetail ? (
              <div className="empty-state compact">
                <strong>Memuat riwayat...</strong>
              </div>
            ) : detailHistory.length === 0 ? (
              <div className="empty-state compact">
                <strong>Belum ada aktivitas workflow</strong>
                <span>
                  Riwayat akan muncul setelah dokumen dikirim untuk review.
                </span>
              </div>
            ) : (
              <div className="data-table-wrap modal-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>AKTIVITAS</th>
                      <th>OLEH</th>
                      <th>KOMENTAR</th>
                      <th>TANGGAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailHistory.map((item, index) => (
                      <tr key={item.documentWorkflowHistoryId ?? index}>
                        <td>{item.action ?? "-"}</td>
                        <td>{item.actionByName ?? "-"}</td>
                        <td>{item.comment ?? "-"}</td>
                        <td>{formatDate(item.createdDt ?? item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showSubmit && selectedDocument && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Submit for Review"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Tutup submit workflow"
            onClick={() => !submittingWorkflow && setShowSubmit(false)}
          />
          <div className="modal wide">
            <div className="modal-header">
              <div>
                <span className="eyebrow">REVIEW & APPROVAL WORKFLOW</span>
                <h2>Submit for Review</h2>
                <p>{selectedDocument.documentTitle}</p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowSubmit(false)}
                disabled={submittingWorkflow}
              >
                <Icon name="close" />
              </button>
            </div>

            {configuration.workflows.length === 0 ? (
              <div className="documents-message error">
                Workflow aktif tidak ditemukan untuk project dan tipe dokumen
                ini.
              </div>
            ) : (
              <form onSubmit={submitForReview}>
                <div className="form-grid">
                  <label className="span-2">
                    <span>Approval workflow *</span>
                    <select
                      value={workflowId}
                      onChange={(event) => {
                        setWorkflowId(event.target.value);
                        setReviewerAssignments({});
                        setApproverAssignments({});
                      }}
                      required
                    >
                      {configuration.workflows.map((workflow) => (
                        <option
                          key={workflow.approvalWorkflowId}
                          value={workflow.approvalWorkflowId}
                        >
                          {workflow.workflowName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Deadline</span>
                    <input
                      type="date"
                      value={workflowDueDate}
                      onChange={(event) =>
                        setWorkflowDueDate(event.target.value)
                      }
                    />
                  </label>

                  <label className="span-2">
                    <span>Catatan pengajuan</span>
                    <textarea
                      rows={2}
                      value={workflowComment}
                      onChange={(event) =>
                        setWorkflowComment(event.target.value)
                      }
                      placeholder="Catatan untuk Reviewer dan Approver..."
                    />
                  </label>
                </div>

                <div className="section-heading">
                  <h3>Workflow stages dan penugasan</h3>
                </div>

                {selectedWorkflow?.stages.map((stage) => {
                  const isReview = stage.stageType.toLowerCase() === "review";
                  const candidates = isReview
                    ? configuration.reviewerUsers
                    : configuration.approverUsers;
                  const assigned = isReview
                    ? (reviewerAssignments[stage.approvalWorkflowStageId] ?? "")
                    : (approverAssignments[stage.approvalWorkflowStageId] ??
                      "");

                  return (
                    <div
                      className="panel stage-card"
                      key={stage.approvalWorkflowStageId}
                    >
                      <div className="project-cell">
                        <div className="file-tile blue">
                          <Icon name={isReview ? "eye" : "check"} />
                        </div>
                        <div>
                          <strong>
                            {stage.sequenceNo}. {stage.stageName}
                          </strong>
                          <span>
                            {stage.stageType} · {stage.approvalMode} ·{" "}
                            {stage.approvalRule}
                            {stage.isRequired ? " · Wajib" : " · Opsional"}
                          </span>
                        </div>
                      </div>
                      <label className="stage-field">
                        <span>
                          {isReview ? "Reviewer" : "Approver"}{" "}
                          {stage.isRequired ? "*" : ""}
                        </span>
                        <select
                          value={assigned}
                          required={stage.isRequired}
                          onChange={(event) => {
                            const value = event.target.value;
                            if (isReview) {
                              setReviewerAssignments((current) => ({
                                ...current,
                                [stage.approvalWorkflowStageId]: value,
                              }));
                            } else {
                              setApproverAssignments((current) => ({
                                ...current,
                                [stage.approvalWorkflowStageId]: value,
                              }));
                            }
                          }}
                        >
                          <option value="">
                            Pilih {isReview ? "Reviewer" : "Approver"}
                          </option>
                          {candidates.map((user) => (
                            <option key={user.userId} value={user.userId}>
                              {user.fullName}
                              {user.email ? ` (${user.email})` : ""}
                            </option>
                          ))}
                        </select>
                        {candidates.length === 0 && (
                          <small className="field-help">
                            Tidak ada {isReview ? "Reviewer" : "Approver"} yang
                            tersedia sebagai anggota project.
                          </small>
                        )}
                      </label>
                    </div>
                  );
                })}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => setShowSubmit(false)}
                    disabled={submittingWorkflow}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={submittingWorkflow || !selectedWorkflow}
                  >
                    {submittingWorkflow ? "Mengirim..." : "Kirim untuk Review"}
                    {!submittingWorkflow && <Icon name="check" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {showUpload && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Upload dokumen"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Tutup formulir"
            onClick={closeUpload}
            disabled={uploading}
          />
          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">MASTER DATA INPUT</span>
                <h2>Upload dokumen</h2>
                <p>Lengkapi seluruh informasi wajib sebelum menyimpan data.</p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={closeUpload}
                disabled={uploading}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={submitUpload}>
              <div className="form-grid">
                <label className="span-2">
                  <span>Proyek *</span>
                  <select
                    value={form.projectId}
                    onChange={(event) => void changeProject(event.target.value)}
                    required
                  >
                    <option value="">Pilih proyek</option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {projectLabel(project)}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Document requirement *</span>
                  <select
                    value={form.projectDocumentRequirementId}
                    onChange={(event) => changeRequirement(event.target.value)}
                    required
                    disabled={!form.projectId}
                  >
                    <option value="">Pilih requirement</option>
                    {options.requirements.map((requirement) => (
                      <option
                        key={requirement.projectDocumentRequirementId}
                        value={requirement.projectDocumentRequirementId}
                      >
                        {requirement.documentName}
                        {requirement.isRequired ? " (Required)" : ""}
                      </option>
                    ))}
                  </select>
                  {form.projectId && options.requirements.length === 0 && (
                    <small className="field-help">
                      Tidak ada requirement yang tersedia untuk proyek ini.
                    </small>
                  )}
                </label>

                <label>
                  <span>Document owner *</span>
                  <select
                    value={form.documentOwnerId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        documentOwnerId: event.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Pilih document owner</option>
                    {options.users.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="span-2">
                  <span>Judul dokumen *</span>
                  <input
                    value={form.documentTitle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        documentTitle: event.target.value,
                      }))
                    }
                    placeholder="Contoh: Business Requirement Document"
                    required
                  />
                </label>

                <label className="span-2">
                  <span>Deskripsi</span>
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Jelaskan isi atau tujuan dokumen..."
                    rows={3}
                  />
                </label>

                <label className="span-2">
                  <span>Keterangan perubahan</span>
                  <input
                    value={form.changeDescription}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        changeDescription: event.target.value,
                      }))
                    }
                    placeholder="Contoh: Initial document upload"
                  />
                </label>

                <label className="span-2">
                  <span>File dokumen *</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.pptx"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        file: event.target.files?.[0] ?? null,
                      }))
                    }
                    required
                  />
                  <small className="field-help">
                    PDF, DOCX, XLSX, atau PPTX. Maksimal 20 MB.
                  </small>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={closeUpload}
                  disabled={uploading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={uploading}
                >
                  {uploading ? "Meng-upload..." : "Upload Dokumen"}
                  {!uploading && <Icon name="check" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVersions && selectedDocument && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Riwayat versi"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Tutup riwayat versi"
            onClick={() => setShowVersions(false)}
          />
          <div className="modal wide">
            <div className="modal-header">
              <div>
                <span className="eyebrow">DOCUMENT VERSIONING</span>
                <h2>Riwayat versi</h2>
                <p>{selectedDocument.documentTitle}</p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowVersions(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="modal-toolbar">
              <button
                type="button"
                className="btn primary small"
                onClick={() => {
                  setNewVersionFile(null);
                  setChangeDescription("");
                  setShowNewVersion(true);
                }}
              >
                <Icon name="upload" /> Upload versi baru
              </button>
            </div>

            {loadingVersions ? (
              <div className="empty-state compact">
                <strong>Memuat riwayat versi...</strong>
              </div>
            ) : versions.length === 0 ? (
              <div className="empty-state compact">
                <Icon name="clock" size={28} />
                <strong>Belum ada riwayat versi</strong>
              </div>
            ) : (
              <div className="data-table-wrap modal-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>VERSI</th>
                      <th>NAMA FILE</th>
                      <th>KETERANGAN PERUBAHAN</th>
                      <th>TANGGAL UPLOAD</th>
                      <th>UKURAN</th>
                      <th>AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((version) => (
                      <tr key={version.documentVersionId}>
                        <td>
                          <div className="version-cell">
                            <strong>v{version.versionNo}</strong>
                            {version.versionNo ===
                              selectedDocument.currentVersionNo && (
                              <Badge tone="green">Terbaru</Badge>
                            )}
                          </div>
                        </td>
                        <td>{version.originalFileName}</td>
                        <td>{version.changeDescription || "-"}</td>
                        <td>{formatDate(version.uploadedDt)}</td>
                        <td>
                          {(version.fileSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn secondary small"
                            onClick={() =>
                              void downloadVersion(
                                selectedDocument.documentId,
                                version.versionNo,
                                version.originalFileName,
                              )
                            }
                          >
                            <Icon name="download" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {showNewVersion && selectedDocument && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Upload versi baru"
        >
          <button
            type="button"
            className="modal-backdrop"
            aria-label="Tutup upload versi baru"
            onClick={() => !uploadingVersion && setShowNewVersion(false)}
          />
          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">DOCUMENT VERSIONING</span>
                <h2>Upload versi baru</h2>
                <p>{selectedDocument.documentTitle}</p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowNewVersion(false)}
                disabled={uploadingVersion}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={submitNewVersion}>
              <div className="form-grid">
                <label>
                  <span>Versi saat ini</span>
                  <input
                    value={`v${selectedDocument.currentVersionNo}`}
                    disabled
                  />
                </label>
                <label>
                  <span>Versi berikutnya</span>
                  <input
                    value={`v${selectedDocument.currentVersionNo + 1}`}
                    disabled
                  />
                </label>
                <label className="span-2">
                  <span>Keterangan perubahan</span>
                  <textarea
                    value={changeDescription}
                    onChange={(event) =>
                      setChangeDescription(event.target.value)
                    }
                    placeholder="Jelaskan perubahan pada versi baru..."
                    rows={3}
                  />
                </label>
                <label className="span-2">
                  <span>File versi baru *</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.pptx"
                    onChange={(event) =>
                      setNewVersionFile(event.target.files?.[0] ?? null)
                    }
                    required
                  />
                  <small className="field-help">
                    PDF, DOCX, XLSX, atau PPTX. Maksimal 20 MB.
                  </small>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowNewVersion(false)}
                  disabled={uploadingVersion}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={uploadingVersion}
                >
                  {uploadingVersion ? "Meng-upload..." : "Upload Versi Baru"}
                  {!uploadingVersion && <Icon name="check" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
