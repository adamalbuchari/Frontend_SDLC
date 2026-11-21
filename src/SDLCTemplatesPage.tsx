import { useEffect, useState } from "react";
import { Badge, Icon } from "./components/ui";

type Phase = {
  sdlPhaseId: string;
  sdlPhaseName: string;
  description?: string;
  sequenceNo: number;
  isActive: boolean;
};

type ProjectType = {
  projectTypeId: string;
  projectTypeName: string;
};

type DocType = {
  documentTypeId: string;
  documentTypeCode: string;
  documentTypeName: string;
  description?: string;
};

type Template = {
  documentTemplateId: string;
  projectTypeId: string;
  projectTypeName: string;
  templateName: string;
  description?: string;
  versionNo: number;
  isActive: boolean;
  itemCount: number;
};

type Item = {
  documentTemplateItemId?: string;
  documentName: string;
  description?: string;
  isRequired: boolean;
  sequenceNo?: number;
  isActive?: boolean;
  sdlPhaseId: string;
  documentTypeId: string;
};

const API = "http://localhost:5100/api/sdlc-templates";

export default function SDLCTemplatesPage() {
  const token = sessionStorage.getItem("docuflow_token");

  const [tab, setTab] = useState<"templates" | "phases" | "types">("templates");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showPhaseForm, setShowPhaseForm] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [editingType, setEditingType] = useState<DocType | null>(null);

  async function api(path: string, init: RequestInit = {}) {
    const response = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Request gagal (${response.status})`);
    }

    return result;
  }

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const [lookup, templateResult, phaseResult] = await Promise.all([
        api("/lookups"),
        api(""),
        api("/phases"),
      ]);

      setPhases(phaseResult.data ?? lookup.data?.phases ?? []);
      setProjectTypes(lookup.data?.projectTypes ?? []);
      setDocTypes(lookup.data?.documentTypes ?? []);
      setTemplates(templateResult.data ?? []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal memuat konfigurasi SDLC.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function openTemplate(template: Template) {
    try {
      const result = await api(`/${template.documentTemplateId}`);

      setSelected(template);
      setItems((result.data?.items ?? []).map((x: Item) => ({ ...x })));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal membuka template.");
    }
  }

  function addItem() {
    setItems((old) => [
      ...old,
      {
        documentName: "",
        description: "",
        isRequired: true,
        sdlPhaseId: phases.find((x) => x.isActive)?.sdlPhaseId ?? "",
        documentTypeId: docTypes[0]?.documentTypeId ?? "",
      },
    ]);
  }

  function updateItem(index: number, patch: Partial<Item>) {
    setItems((old) =>
      old.map((x, i) => (i === index ? { ...x, ...patch } : x)),
    );
  }

  async function saveItems() {
    if (!selected) return;

    setSaving(true);

    try {
      await api(`/${selected.documentTemplateId}/items`, {
        method: "PUT",
        body: JSON.stringify(items),
      });

      await loadAll();
      alert("Konfigurasi dokumen template berhasil disimpan.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan item template.");
    } finally {
      setSaving(false);
    }
  }

  async function saveTemplate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const f = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const payload = {
        projectTypeId: String(f.get("projectTypeId")),
        templateName: String(f.get("templateName")),
        description: String(f.get("description") ?? ""),
        versionNo: Number(f.get("versionNo") || 1),
      };

      const result = await api(
        selected ? `/${selected.documentTemplateId}` : "",
        {
          method: selected ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setShowTemplateForm(false);
      await loadAll();

      if (!selected && result.data?.documentTemplateId) {
        const created = (await api("")).data?.find(
          (x: Template) =>
            x.documentTemplateId === result.data.documentTemplateId,
        );

        if (created) {
          setSelected(created);
          setItems([]);
        }
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan template.");
    } finally {
      setSaving(false);
    }
  }

  async function setTemplateStatus(t: Template) {
    try {
      await api(`/${t.documentTemplateId}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !t.isActive }),
      });

      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengubah status.");
    }
  }

  async function savePhase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const f = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const payload = {
        sdlPhaseName: String(f.get("sdlPhaseName")),
        description: String(f.get("description") ?? ""),
        isActive: editingPhase?.isActive ?? true,
      };

      await api(
        editingPhase ? `/phases/${editingPhase.sdlPhaseId}` : "/phases",
        {
          method: editingPhase ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setShowPhaseForm(false);
      setEditingPhase(null);
      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan fase.");
    } finally {
      setSaving(false);
    }
  }

  async function movePhase(index: number, direction: -1 | 1) {
    const next = [...phases];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    [next[index], next[target]] = [next[target], next[index]];

    setPhases(next);

    try {
      await api("/phases/order", {
        method: "PUT",
        body: JSON.stringify({
          ids: next.map((x) => x.sdlPhaseId),
        }),
      });

      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengubah urutan fase.");

      await loadAll();
    }
  }

  async function saveType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const f = new FormData(event.currentTarget);
    setSaving(true);

    try {
      const payload = {
        documentTypeCode: String(f.get("code")),
        documentTypeName: String(f.get("name")),
        description: String(f.get("description") ?? ""),
        isActive: true,
      };

      await api(
        editingType
          ? `/document-types/${editingType.documentTypeId}`
          : "/document-types",
        {
          method: editingType ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );

      setShowTypeForm(false);
      setEditingType(null);
      await loadAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menyimpan jenis dokumen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page list-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">SYSTEM CONFIGURATION</span>
          <h1>SDLC Templates</h1>
          <p>
            Kelola template SDLC, urutan fase, serta jenis dan kewajiban dokumen
            untuk proyek.
          </p>
        </div>

        {tab === "templates" && (
          <button
            className="btn primary"
            onClick={() => {
              setSelected(null);
              setShowTemplateForm(true);
            }}
          >
            <Icon name="plus" />
            Tambah template
          </button>
        )}

        {tab === "phases" && (
          <button
            className="btn primary"
            onClick={() => {
              setEditingPhase(null);
              setShowPhaseForm(true);
            }}
          >
            <Icon name="plus" />
            Tambah fase
          </button>
        )}

        {tab === "types" && (
          <button
            className="btn primary"
            onClick={() => {
              setEditingType(null);
              setShowTypeForm(true);
            }}
          >
            <Icon name="plus" />
            Tambah jenis dokumen
          </button>
        )}
      </section>

      <div className="table-toolbar" style={{ marginBottom: 18 }}>
        <div className="row-actions">
          <button
            className={`btn ${
              tab === "templates" ? "primary" : "secondary"
            } small`}
            onClick={() => {
              setTab("templates");
              setSelected(null);
            }}
          >
            Template
          </button>

          <button
            className={`btn ${
              tab === "phases" ? "primary" : "secondary"
            } small`}
            onClick={() => setTab("phases")}
          >
            Fase SDLC
          </button>

          <button
            className={`btn ${tab === "types" ? "primary" : "secondary"} small`}
            onClick={() => setTab("types")}
          >
            Jenis Dokumen
          </button>
        </div>
      </div>

      {error && <div className="inline-message error">{error}</div>}

      {loading && (
        <div className="empty-state">
          <strong>Memuat konfigurasi SDLC...</strong>
        </div>
      )}

      {!loading && tab === "templates" && !selected && (
        <section className="panel table-panel">
          <div className="data-table-wrap">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>NAMA TEMPLATE</th>
                  <th>JENIS PROYEK</th>
                  <th>VERSI</th>
                  <th>DOKUMEN</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {templates.map((t) => (
                  <tr key={t.documentTemplateId}>
                    <td>
                      <div className="project-cell">
                        <div>
                          <strong>{t.templateName}</strong>
                          <span>{t.description || "Tanpa deskripsi"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{t.projectTypeName}</td>
                    <td>v{t.versionNo}</td>
                    <td>{t.itemCount} item</td>

                    <td>
                      <Badge tone={t.isActive ? "green" : "red"}>
                        {t.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn secondary small"
                          onClick={() => void openTemplate(t)}
                        >
                          Kelola dokumen
                        </button>

                        <button
                          className="btn secondary small"
                          onClick={() => {
                            setSelected(t);
                            setShowTemplateForm(true);
                          }}
                        >
                          Edit
                        </button>

                        <button
                          className="btn secondary small"
                          onClick={() => void setTemplateStatus(t)}
                        >
                          {t.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {templates.length === 0 && (
              <div className="empty-state">
                <strong>Belum ada template SDLC</strong>
                <span>
                  Buat template pertama untuk mulai mengatur kebutuhan dokumen
                  proyek.
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && tab === "templates" && selected && (
        <section className="panel table-panel">
          <div className="modal-header">
            <div>
              <span className="eyebrow">TEMPLATE CONFIGURATION</span>
              <h2>{selected.templateName}</h2>
              <p>
                Atur dokumen wajib/opsional, fase SDLC, jenis dokumen, dan
                urutannya.
              </p>
            </div>

            <button
              className="btn secondary small"
              onClick={() => setSelected(null)}
            >
              Kembali ke daftar
            </button>
          </div>

          <div className="data-table-wrap">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>URUTAN</th>
                  <th>NAMA DOKUMEN</th>
                  <th>FASE SDLC</th>
                  <th>JENIS DOKUMEN</th>
                  <th>KEWAJIBAN</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>

                    <td>
                      <input
                        value={item.documentName}
                        onChange={(e) =>
                          updateItem(i, {
                            documentName: e.target.value,
                          })
                        }
                        placeholder="Nama dokumen"
                      />
                    </td>

                    <td>
                      <select
                        value={item.sdlPhaseId}
                        onChange={(e) =>
                          updateItem(i, {
                            sdlPhaseId: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih fase</option>
                        {phases
                          .filter((p) => p.isActive)
                          .map((p) => (
                            <option key={p.sdlPhaseId} value={p.sdlPhaseId}>
                              {p.sdlPhaseName}
                            </option>
                          ))}
                      </select>
                    </td>

                    <td>
                      <select
                        value={item.documentTypeId}
                        onChange={(e) =>
                          updateItem(i, {
                            documentTypeId: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih jenis</option>
                        {docTypes.map((d) => (
                          <option
                            key={d.documentTypeId}
                            value={d.documentTypeId}
                          >
                            {d.documentTypeName}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <select
                        value={item.isRequired ? "true" : "false"}
                        onChange={(e) =>
                          updateItem(i, {
                            isRequired: e.target.value === "true",
                          })
                        }
                      >
                        <option value="true">Wajib</option>
                        <option value="false">Opsional</option>
                      </select>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn secondary small"
                          disabled={i === 0}
                          onClick={() =>
                            setItems((old) => {
                              const next = [...old];
                              [next[i - 1], next[i]] = [next[i], next[i - 1]];
                              return next;
                            })
                          }
                        >
                          ↑
                        </button>

                        <button
                          className="btn secondary small"
                          disabled={i === items.length - 1}
                          onClick={() =>
                            setItems((old) => {
                              const next = [...old];
                              [next[i + 1], next[i]] = [next[i], next[i + 1]];
                              return next;
                            })
                          }
                        >
                          ↓
                        </button>

                        <button
                          className="btn secondary small danger"
                          onClick={() =>
                            setItems((old) => old.filter((_, j) => j !== i))
                          }
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && (
              <div className="empty-state">
                <strong>Belum ada dokumen dalam template</strong>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button className="btn secondary" onClick={addItem}>
              <Icon name="plus" />
              Tambah dokumen
            </button>

            <button
              className="btn primary"
              disabled={saving || items.length === 0}
              onClick={() => void saveItems()}
            >
              {saving ? "Menyimpan..." : "Simpan konfigurasi"}
              <Icon name="check" />
            </button>
          </div>
        </section>
      )}

      {!loading && tab === "phases" && (
        <section className="panel table-panel">
          <div className="data-table-wrap">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>URUTAN</th>
                  <th>NAMA FASE</th>
                  <th>DESKRIPSI</th>
                  <th>STATUS</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {phases.map((p, i) => (
                  <tr key={p.sdlPhaseId}>
                    <td>{p.sequenceNo}</td>
                    <td>
                      <strong>{p.sdlPhaseName}</strong>
                    </td>
                    <td>{p.description || "-"}</td>

                    <td>
                      <Badge tone={p.isActive ? "green" : "red"}>
                        {p.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="btn secondary small"
                          disabled={i === 0}
                          onClick={() => void movePhase(i, -1)}
                        >
                          ↑
                        </button>

                        <button
                          className="btn secondary small"
                          disabled={i === phases.length - 1}
                          onClick={() => void movePhase(i, 1)}
                        >
                          ↓
                        </button>

                        <button
                          className="btn secondary small"
                          onClick={() => {
                            setEditingPhase(p);
                            setShowPhaseForm(true);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {phases.length === 0 && (
              <div className="empty-state">
                <strong>Belum ada fase SDLC</strong>
                <span>Tambahkan fase dan susun urutannya.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {!loading && tab === "types" && (
        <section className="panel table-panel">
          <div className="data-table-wrap">
            <table className="data-table module-table">
              <thead>
                <tr>
                  <th>KODE</th>
                  <th>JENIS DOKUMEN</th>
                  <th>DESKRIPSI</th>
                  <th>AKSI</th>
                </tr>
              </thead>

              <tbody>
                {docTypes.map((d) => (
                  <tr key={d.documentTypeId}>
                    <td>{d.documentTypeCode}</td>
                    <td>
                      <strong>{d.documentTypeName}</strong>
                    </td>
                    <td>{d.description || "-"}</td>
                    <td>
                      <button
                        className="btn secondary small"
                        onClick={() => {
                          setEditingType(d);
                          setShowTypeForm(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {docTypes.length === 0 && (
              <div className="empty-state">
                <strong>Belum ada jenis dokumen</strong>
              </div>
            )}
          </div>
        </section>
      )}

      {showTemplateForm && (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <button
            className="modal-backdrop"
            onClick={() => setShowTemplateForm(false)}
          />

          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">SDLC TEMPLATE</span>
                <h2>{selected ? "Edit template" : "Tambah template"}</h2>
                <p>Tentukan template untuk jenis proyek.</p>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowTemplateForm(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={saveTemplate}>
              <div className="form-grid">
                <label className="span-2">
                  <span>Jenis proyek *</span>
                  <select
                    name="projectTypeId"
                    required
                    defaultValue={selected?.projectTypeId ?? ""}
                  >
                    <option value="">Pilih jenis proyek</option>
                    {projectTypes.map((p) => (
                      <option key={p.projectTypeId} value={p.projectTypeId}>
                        {p.projectTypeName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="span-2">
                  <span>Nama template *</span>
                  <input
                    name="templateName"
                    required
                    defaultValue={selected?.templateName ?? ""}
                    placeholder="Contoh: Standard SDLC"
                  />
                </label>

                <label className="span-2">
                  <span>Deskripsi</span>
                  <textarea
                    name="description"
                    defaultValue={selected?.description ?? ""}
                  />
                </label>

                <label>
                  <span>Versi</span>
                  <input
                    name="versionNo"
                    type="number"
                    min="1"
                    defaultValue={selected?.versionNo ?? 1}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowTemplateForm(false)}
                >
                  Batal
                </button>

                <button className="btn primary" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPhaseForm && (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <button
            className="modal-backdrop"
            onClick={() => setShowPhaseForm(false)}
          />

          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">SDLC PHASE</span>
                <h2>{editingPhase ? "Edit fase" : "Tambah fase"}</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowPhaseForm(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={savePhase}>
              <div className="form-grid">
                <label className="span-2">
                  <span>Nama fase *</span>
                  <input
                    name="sdlPhaseName"
                    required
                    defaultValue={editingPhase?.sdlPhaseName ?? ""}
                  />
                </label>

                <label className="span-2">
                  <span>Deskripsi</span>
                  <textarea
                    name="description"
                    defaultValue={editingPhase?.description ?? ""}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowPhaseForm(false)}
                >
                  Batal
                </button>

                <button className="btn primary" disabled={saving}>
                  Simpan fase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTypeForm && (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <button
            className="modal-backdrop"
            onClick={() => setShowTypeForm(false)}
          />

          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">DOCUMENT TYPE</span>
                <h2>
                  {editingType ? "Edit jenis dokumen" : "Tambah jenis dokumen"}
                </h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setShowTypeForm(false)}
              >
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={saveType}>
              <div className="form-grid">
                <label>
                  <span>Kode *</span>
                  <input
                    name="code"
                    required
                    defaultValue={editingType?.documentTypeCode ?? ""}
                  />
                </label>

                <label>
                  <span>Nama jenis dokumen *</span>
                  <input
                    name="name"
                    required
                    defaultValue={editingType?.documentTypeName ?? ""}
                  />
                </label>

                <label className="span-2">
                  <span>Deskripsi</span>
                  <textarea
                    name="description"
                    defaultValue={editingType?.description ?? ""}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowTypeForm(false)}
                >
                  Batal
                </button>

                <button className="btn primary" disabled={saving}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
