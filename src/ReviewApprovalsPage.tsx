import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Badge, Icon, type IconName } from "./components/ui";

const API_BASE = "http://localhost:5100/api/review-approvals";

type Task = {
  documentWorkflowAssignmentId: string;
  documentId: string;
  documentTitle?: string;
  documentName?: string;
  projectName?: string;
  assignmentType: string;
  assignmentStatus: string;
  stageName?: string;
  workflowStatus?: string;
  dueDate?: string;
  [key: string]: any;
};

type HistoryItem = {
  action?: string;
  actorName?: string;
  actorUserName?: string;
  comment?: string;
  previousStatus?: string;
  newStatus?: string;
  actionAt?: string;
  [key: string]: any;
};

function getData(result: any): any {
  return result?.data?.data ?? result?.data ?? result;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("id-ID");
}

function statusTone(status?: string) {
  const value = (status ?? "").toLowerCase();

  if (value === "pending") return "amber";
  if (value === "waiting") return "neutral";
  if (value === "completed" || value === "approved") return "green";
  if (value.includes("revision")) return "amber";
  if (value === "rejected") return "red";

  return "neutral";
}

type Decision = "Complete" | "Revision Required" | "Approve" | "Reject";

function decisionOptions(isReviewer: boolean): {
  decision: Decision;
  title: string;
  description: string;
  icon: IconName;
  tone: string;
}[] {
  return isReviewer
    ? [
        {
          decision: "Complete",
          title: "Complete review",
          description: "Review selesai dan dokumen dapat dilanjutkan.",
          icon: "check",
          tone: "green",
        },
        {
          decision: "Revision Required",
          title: "Request revision",
          description: "Kembalikan dokumen kepada pemilik untuk diperbaiki.",
          icon: "alert",
          tone: "amber",
        },
      ]
    : [
        {
          decision: "Approve",
          title: "Approve document",
          description: "Dokumen memenuhi ketentuan dan dapat dilanjutkan.",
          icon: "check",
          tone: "green",
        },
        {
          decision: "Reject",
          title: "Reject document",
          description: "Dokumen ditolak dan workflow akan dihentikan.",
          icon: "close",
          tone: "red",
        },
      ];
}

function DecisionModal({
  task,
  busy,
  onClose,
  onSubmit,
}: {
  task: Task;
  busy: boolean;
  onClose: () => void;
  onSubmit: (decision: Decision, comment: string) => void;
}) {
  const isReviewer = task.assignmentType?.toLowerCase() === "reviewer";
  const options = decisionOptions(isReviewer);
  const [selected, setSelected] = useState<Decision | "">("");
  const [comment, setComment] = useState("");
  const needsComment =
    selected === "Revision Required" || selected === "Reject";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (needsComment && !comment.trim()) return;
    onSubmit(selected, comment.trim());
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Keputusan approval"
    >
      <button
        type="button"
        className="modal-backdrop"
        aria-label="Tutup keputusan approval"
        onClick={() => !busy && onClose()}
      />
      <div className="modal decision-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">REVIEW DECISION</span>
            <h2>Tentukan keputusan dokumen</h2>
            <p>
              {task.documentTitle ??
                task.documentName ??
                task.title ??
                "Dokumen"}{" "}
              · Status saat ini: <strong>{task.assignmentStatus}</strong>
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            disabled={busy}
          >
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="decision-content">
            <span className="decision-label">Pilih keputusan *</span>
            <div className="decision-options">
              {options.map((option) => (
                <button
                  type="button"
                  key={option.decision}
                  className={`decision-option decision-${option.tone} ${
                    selected === option.decision ? "selected" : ""
                  }`}
                  onClick={() => setSelected(option.decision)}
                >
                  <div>
                    <Icon name={option.icon} size={17} />
                  </div>
                  <span>
                    <strong>{option.title}</strong>
                    <small>{option.description}</small>
                  </span>
                  <i>
                    {selected === option.decision && (
                      <Icon name="check" size={13} />
                    )}
                  </i>
                </button>
              ))}
            </div>

            <label className="decision-comment">
              <span>Komentar keputusan{needsComment && " *"}</span>
              <textarea
                required={needsComment}
                rows={3}
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={
                  needsComment
                    ? "Jelaskan alasan atau perbaikan yang diperlukan..."
                    : "Tambahkan catatan (opsional)..."
                }
              />
            </label>

            <div className="decision-notice">
              <Icon name="alert" size={14} />
              Keputusan akan tercatat pada approval history dan activity log.
            </div>
          </div>

          <div className="modal-actions decision-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={onClose}
              disabled={busy}
            >
              Batal
            </button>
            <button
              className="btn primary"
              type="submit"
              disabled={!selected || busy}
            >
              {busy ? "Memproses..." : "Simpan keputusan"}
              {!busy && <Icon name="arrow" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ReviewApprovalsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [decisionTask, setDecisionTask] = useState<Task | null>(null);
  const [historyId, setHistoryId] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const getHeaders = useCallback(() => {
    const token = sessionStorage.getItem("docuflow_token");

    if (!token) {
      throw new Error("Sesi login tidak ditemukan. Silakan login kembali.");
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/my-tasks`, {
        headers: getHeaders(),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? "Gagal mengambil daftar tugas Review & Approval.",
        );
      }

      const data = getData(result);
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function submitDecision(
    task: Task,
    decision: Decision,
    comment: string,
  ) {
    setBusyId(task.documentWorkflowAssignmentId);
    setError("");

    try {
      const isReviewer = task.assignmentType?.toLowerCase() === "reviewer";
      const endpoint = isReviewer ? "review" : "approve";

      const response = await fetch(
        `${API_BASE}/${task.documentWorkflowAssignmentId}/${endpoint}`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ decision, comment }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Keputusan gagal disimpan.");
      }

      window.alert(result?.message ?? "Keputusan berhasil disimpan.");
      setDecisionTask(null);

      await loadTasks();

      if (historyId === task.documentId) {
        await loadHistory(task.documentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setBusyId("");
      setDecisionTask(null);
    }
  }

  async function loadHistory(documentId: string) {
    setHistoryId(documentId);
    setHistoryLoading(true);
    setHistory([]);

    try {
      const response = await fetch(
        `${API_BASE}/documents/${documentId}/history`,
        { headers: getHeaders() },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message ?? "Gagal mengambil riwayat workflow.");
      }

      const data = getData(result);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil riwayat.");
    } finally {
      setHistoryLoading(false);
    }
  }

  const pendingCount = tasks.filter(
    (task) => task.assignmentStatus?.toLowerCase() === "pending",
  ).length;
  const waitingCount = tasks.filter(
    (task) => task.assignmentStatus?.toLowerCase() === "waiting",
  ).length;

  const taskTitle = (task: Task) =>
    task.documentTitle ?? task.documentName ?? task.title ?? "Dokumen";

  return (
    <div className="page list-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">GOVERNANCE QUEUE</span>
          <h1>Review & Approvals</h1>
          <p>Tinjau dokumen dan putuskan approval secara tertelusur.</p>
        </div>

        <button
          className="btn primary"
          onClick={() => void loadTasks()}
          disabled={loading}
        >
          <Icon name="stamp" />
          {loading ? "Memuat..." : "Refresh tugas"}
        </button>
      </section>

      <section className="module-feature">
        <div className="module-feature-icon">
          <Icon name="stamp" size={25} />
        </div>
        <div>
          <span>Ringkasan hari ini</span>
          <strong>
            {pendingCount} tugas menunggu tindakan, {waitingCount} menunggu
            giliran
          </strong>
        </div>
      </section>

      {error && <div className="inline-message error">{error}</div>}

      <section className="panel table-panel">
        <div className="table-toolbar toolbar-title">
          <div>
            <h2>Daftar Tugas Saya</h2>
            <p>Total {tasks.length} tugas review dan approval.</p>
          </div>
        </div>

        <div className="data-table-wrap">
          {loading ? (
            <div className="empty-state">
              <strong>Memuat daftar tugas...</strong>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <Icon name="stamp" size={28} />
              <strong>Tidak ada tugas Review & Approval</strong>
              <span>
                Tugas yang diberikan kepada akun Anda akan muncul di sini.
              </span>
            </div>
          ) : (
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>DOKUMEN</th>
                  <th>TAHAP</th>
                  <th>PERAN</th>
                  <th>STATUS TUGAS</th>
                  <th>STATUS WORKFLOW</th>
                  <th>JATUH TEMPO</th>
                  <th>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const isPending =
                    task.assignmentStatus?.toLowerCase() === "pending";
                  const isBusy = busyId === task.documentWorkflowAssignmentId;

                  return (
                    <tr key={task.documentWorkflowAssignmentId}>
                      <td>
                        <div className="project-cell">
                          <div className="file-tile blue">
                            <Icon name="file" />
                          </div>
                          <div>
                            <strong>{taskTitle(task)}</strong>
                            {task.projectName && (
                              <span>{task.projectName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{task.stageName ?? "-"}</td>
                      <td>
                        <Badge tone="blue">{task.assignmentType}</Badge>
                      </td>
                      <td>
                        <Badge tone={statusTone(task.assignmentStatus)}>
                          {task.assignmentStatus}
                        </Badge>
                      </td>
                      <td>
                        {task.workflowStatus ? (
                          <Badge tone={statusTone(task.workflowStatus)}>
                            {task.workflowStatus}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{formatDate(task.dueDate)}</td>
                      <td>
                        <div className="row-actions">
                          {isPending && (
                            <button
                              className="decision-trigger"
                              disabled={isBusy}
                              onClick={() => setDecisionTask(task)}
                            >
                              <Icon name="stamp" size={14} />
                              Tindak lanjut
                            </button>
                          )}
                          <button
                            className="icon-btn"
                            title="Lihat riwayat"
                            aria-label="Lihat riwayat"
                            onClick={() => void loadHistory(task.documentId)}
                          >
                            <Icon name="clock" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {historyId && (
        <section className="panel table-panel history-panel">
          <div className="table-toolbar toolbar-title">
            <div>
              <h2>Review & Approval History</h2>
              <p>Riwayat aktivitas workflow untuk dokumen terpilih.</p>
            </div>
            <button
              className="icon-btn"
              aria-label="Tutup riwayat"
              onClick={() => {
                setHistoryId("");
                setHistory([]);
              }}
            >
              <Icon name="close" />
            </button>
          </div>

          <div className="data-table-wrap">
            {historyLoading ? (
              <div className="empty-state compact">
                <strong>Memuat riwayat...</strong>
              </div>
            ) : history.length === 0 ? (
              <div className="empty-state compact">
                <Icon name="clock" size={28} />
                <strong>Belum ada riwayat</strong>
                <span>Riwayat belum tersedia untuk dokumen ini.</span>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>AKTIVITAS</th>
                    <th>OLEH</th>
                    <th>PERUBAHAN STATUS</th>
                    <th>KOMENTAR</th>
                    <th>TANGGAL</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <strong className="person-name">
                          {item.action ?? "Workflow Action"}
                        </strong>
                      </td>
                      <td>{item.actorName ?? item.actorUserName ?? "-"}</td>
                      <td>
                        {item.previousStatus || item.newStatus
                          ? `${item.previousStatus ?? "-"} → ${item.newStatus ?? "-"}`
                          : "-"}
                      </td>
                      <td>{item.comment || "-"}</td>
                      <td>{formatDate(item.actionAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {decisionTask && (
        <DecisionModal
          task={decisionTask}
          busy={busyId === decisionTask.documentWorkflowAssignmentId}
          onClose={() => setDecisionTask(null)}
          onSubmit={(decision, comment) =>
            void submitDecision(decisionTask, decision, comment)
          }
        />
      )}
    </div>
  );
}
