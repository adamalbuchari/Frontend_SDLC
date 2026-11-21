import DocumentsPage from "./components/DocumentsPage";
import AdministrationPage from "./AdministrationPage";
import ReviewApprovalsPage from "./ReviewApprovalsPage";
import { Badge, Icon, type IconName } from "./components/ui";
import { useEffect, useMemo, useRef, useState } from "react";

const navItems: { label: string; icon: IconName; count?: number }[] = [
  { label: "Dashboard", icon: "grid" },
  { label: "Projects", icon: "folder" },
  { label: "Documents", icon: "file" },
  { label: "Review & Approvals", icon: "stamp", count: 5 },
  { label: "Reports", icon: "chart" },
];

const projects = [
  {
    code: "PRJ-2025-014",
    name: "Mobile Banking Revamp",
    manager: "Raka Pratama",
    progress: 82,
    status: "At Risk",
    due: "28 Jun 2025",
    docs: "41 / 50",
    color: "#4f46e5",
  },
  {
    code: "PRJ-2025-011",
    name: "Customer Data Platform",
    manager: "Maya Putri",
    progress: 68,
    status: "On Track",
    due: "14 Jul 2025",
    docs: "34 / 50",
    color: "#0891b2",
  },
  {
    code: "PRJ-2025-008",
    name: "Core System Integration",
    manager: "Budi Santoso",
    progress: 54,
    status: "On Track",
    due: "30 Aug 2025",
    docs: "27 / 50",
    color: "#7c3aed",
  },
  {
    code: "PRJ-2025-003",
    name: "Digital Lending Platform",
    manager: "Ayu Lestari",
    progress: 91,
    status: "Delayed",
    due: "21 Jun 2025",
    docs: "46 / 50",
    color: "#db2777",
  },
  {
    code: "PRJ-2024-029",
    name: "Enterprise Data Warehouse",
    manager: "Dimas Akbar",
    progress: 76,
    status: "On Track",
    due: "12 Sep 2025",
    docs: "38 / 50",
    color: "#059669",
  },
];

const approvals = [
  {
    name: "UAT Sign-Off",
    project: "Mobile Banking Revamp",
    owner: "Nadia P.",
    version: "v1.2",
    age: "2 jam",
    avatar: "NP",
    tone: "violet",
  },
  {
    name: "Technical Specification",
    project: "Customer Data Platform",
    owner: "Andi W.",
    version: "v2.0",
    age: "5 jam",
    avatar: "AW",
    tone: "blue",
  },
  {
    name: "Deployment Plan",
    project: "Digital Lending Platform",
    owner: "Sinta K.",
    version: "v1.0",
    age: "1 hari",
    avatar: "SK",
    tone: "amber",
  },
];

const activities = [
  {
    title: "Dokumen disetujui",
    text: "Rizky menyetujui FSD v2.1",
    project: "Mobile Banking Revamp",
    time: "12 menit lalu",
    color: "green",
    icon: "check" as IconName,
  },
  {
    title: "Versi baru diunggah",
    text: "Maya mengunggah BRD v1.4",
    project: "Customer Data Platform",
    time: "48 menit lalu",
    color: "blue",
    icon: "upload" as IconName,
  },
  {
    title: "Revisi diperlukan",
    text: "Andi meminta revisi Test Plan",
    project: "Core System Integration",
    time: "2 jam lalu",
    color: "amber",
    icon: "alert" as IconName,
  },
  {
    title: "Proyek diperbarui",
    text: "Timeline proyek telah diperbarui",
    project: "Digital Lending Platform",
    time: "4 jam lalu",
    color: "purple",
    icon: "calendar" as IconName,
  },
];

function Progress({
  value,
  color = "#4f46e5",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="progress-track">
      <div
        className="progress-value"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  );
}

// Data pengguna yang sedang login (disimpan saat login berhasil).
function getSessionUser(): {
  fullName: string;
  role: string;
  roles: string[];
} {
  try {
    const raw = JSON.parse(sessionStorage.getItem("docuflow_user") || "{}");
    const roles: string[] = raw.roles ?? raw.Roles ?? [];
    const role: string = raw.role ?? raw.Role ?? roles[0] ?? "-";
    return {
      fullName: raw.fullName ?? raw.FullName ?? "Pengguna",
      role,
      roles: roles.length ? roles : [role],
    };
  } catch {
    return { fullName: "Pengguna", role: "-", roles: [] };
  }
}

function initialsOf(value: string) {
  return (
    value
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function Sidebar({
  active,
  setActive,
  open,
  close,
}: {
  active: string;
  setActive: (v: string) => void;
  open: boolean;
  close: () => void;
}) {
  const sessionUser = getSessionUser();

  return (
    <>
      {open && (
        <button
          aria-label="Tutup navigasi"
          className="sidebar-backdrop"
          onClick={close}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>DocuFlow</strong>
            <small>SDLC Governance</small>
          </div>
          <button className="icon-btn sidebar-close" onClick={close}>
            <Icon name="close" />
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">NT</div>
          <div>
            <span>Workspace</span>
            <strong>Nusantara Tech</strong>
          </div>
          <Icon name="chevron" size={15} />
        </div>
        <nav className="nav-list">
          <p className="nav-label">WORKSPACE</p>
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${active === item.label ? "active" : ""}`}
              onClick={() => {
                setActive(item.label);
                close();
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.count && <b>{item.count}</b>}
            </button>
          ))}
          <p className="nav-label admin-label">ADMINISTRATION</p>
          <button
            className={`nav-item ${active === "Administration" ? "active" : ""}`}
            onClick={() => {
              setActive("Administration");
              close();
            }}
          >
            <Icon name="settings" />
            <span>Administration</span>
            <Icon className="nav-chevron" name="chevron" size={14} />
          </button>
        </nav>
        <div className="sidebar-help">
          <div className="help-icon">?</div>
          <div>
            <strong>Butuh bantuan?</strong>
            <span>Lihat pusat dokumentasi</span>
          </div>
          <Icon name="arrow" size={15} />
        </div>
        <div className="sidebar-profile">
          <div className="avatar">{initialsOf(sessionUser.fullName)}</div>
          <div title={sessionUser.roles.join(", ")}>
            <strong>{sessionUser.fullName}</strong>
            <span>
              {sessionUser.role}
              {sessionUser.roles.length > 1 &&
                ` +${sessionUser.roles.length - 1}`}
            </span>
          </div>
          <Icon name="dots" />
        </div>
      </aside>
    </>
  );
}

function Topbar({
  active,
  onMenu,
  onSearch,
  onLogout,
}: {
  active: string;
  onMenu: () => void;
  onSearch: (v: string) => void;
  onLogout: () => void;
}) {
  const sessionUser = getSessionUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const close = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [profileOpen]);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="icon-btn mobile-menu" onClick={onMenu}>
          <Icon name="menu" />
        </button>
        <span>Workspace</span>
        <Icon name="chevron" size={13} />
        <strong>{active}</strong>
      </div>
      <div className="top-actions">
        <label className="global-search">
          <Icon name="search" size={17} />
          <input
            aria-label="Pencarian global"
            placeholder="Cari proyek, dokumen..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </label>
        <button className="icon-btn notification">
          <Icon name="bell" />
          <span />
        </button>
        <div className="top-profile" ref={profileRef}>
          <button
            className="top-avatar"
            onClick={() => setProfileOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            title={`${sessionUser.fullName} · ${sessionUser.role}`}
          >
            {initialsOf(sessionUser.fullName)}
          </button>
          {profileOpen && (
            <div className="profile-menu" role="menu">
              <div className="profile-info">
                <strong>{sessionUser.fullName}</strong>
                <span>
                  {sessionUser.roles.length
                    ? sessionUser.roles.join(", ")
                    : "-"}
                </span>
              </div>
              <button
                className="profile-logout"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
              >
                <Icon name="logout" size={14} />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Dashboard({
  setActive,
  openModal,
}: {
  setActive: (v: string) => void;
  openModal: () => void;
}) {
  const [period, setPeriod] = useState("30 hari terakhir");
  const [phase, setPhase] = useState("Semua fase");
  const [chartMode, setChartMode] = useState("Dokumen");
  const bars = [42, 56, 49, 70, 62, 78, 72, 85, 75, 92, 88, 97];
  const kpis = [
    {
      label: "Proyek Aktif",
      value: "24",
      change: "+3 bulan ini",
      icon: "folder" as IconName,
      tone: "indigo",
      note: "18 berjalan sesuai jadwal",
    },
    {
      label: "Total Dokumen",
      value: "1,284",
      change: "+8.2%",
      icon: "file" as IconName,
      tone: "blue",
      note: "103 dokumen baru",
    },
    {
      label: "Menunggu Review",
      value: "38",
      change: "12 prioritas",
      icon: "clock" as IconName,
      tone: "amber",
      note: "Rata-rata 1.8 hari",
    },
    {
      label: "Dokumen Terlambat",
      value: "7",
      change: "-3 minggu ini",
      icon: "alert" as IconName,
      tone: "red",
      note: "Di 4 proyek aktif",
    },
  ];
  return (
    <div className="page dashboard-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">RABU, 18 JUNI 2025</span>
          <h1>Selamat pagi, Arif</h1>
          <p>Berikut ringkasan tata kelola dokumentasi hari ini.</p>
        </div>
        <div className="heading-actions">
          <button className="btn secondary">
            <Icon name="download" />
            Export laporan
          </button>
          <button className="btn primary" onClick={openModal}>
            <Icon name="plus" />
            Proyek baru
          </button>
        </div>
      </section>
      <section className="filter-bar">
        <div className="filter-title">
          <Icon name="filter" size={16} />
          <span>Filter tampilan</span>
        </div>
        <label>
          <span>Periode</span>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>30 hari terakhir</option>
            <option>Kuartal ini</option>
            <option>Tahun ini</option>
          </select>
        </label>
        <label>
          <span>Fase SDLC</span>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option>Semua fase</option>
            <option>Requirement Analysis</option>
            <option>System Design</option>
            <option>Testing</option>
          </select>
        </label>
        <button
          className="clear-filter"
          onClick={() => {
            setPeriod("30 hari terakhir");
            setPhase("Semua fase");
          }}
        >
          Reset filter
        </button>
        <span className="data-updated">
          <span /> Diperbarui 5 menit lalu
        </span>
      </section>
      <section className="kpi-grid">
        {kpis.map((kpi) => (
          <article className="kpi-card" key={kpi.label}>
            <div className={`kpi-icon ${kpi.tone}`}>
              <Icon name={kpi.icon} />
            </div>
            <button className="card-menu">
              <Icon name="dots" />
            </button>
            <span className="kpi-label">{kpi.label}</span>
            <div className="kpi-value-row">
              <strong>{kpi.value}</strong>
              <span className={kpi.tone === "red" ? "down" : ""}>
                <Icon name="trend" size={13} />
                {kpi.change}
              </span>
            </div>
            <p>{kpi.note}</p>
          </article>
        ))}
      </section>
      <section className="analytics-grid">
        <article className="panel progress-panel">
          <div className="panel-header">
            <div>
              <h2>Progres dokumentasi</h2>
              <p>Penyelesaian dokumen di seluruh proyek aktif</p>
            </div>
            <div className="segmented">
              <button
                className={chartMode === "Dokumen" ? "selected" : ""}
                onClick={() => setChartMode("Dokumen")}
              >
                Dokumen
              </button>
              <button
                className={chartMode === "Proyek" ? "selected" : ""}
                onClick={() => setChartMode("Proyek")}
              >
                Proyek
              </button>
            </div>
          </div>
          <div className="chart-summary">
            <div>
              <strong>{chartMode === "Dokumen" ? "76.4%" : "68.2%"}</strong>
              <span>Rata-rata penyelesaian</span>
            </div>
            <Badge tone="green">+6.8% dari periode lalu</Badge>
          </div>
          <div className="bar-chart">
            <div className="y-labels">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0</span>
            </div>
            <div className="chart-area">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} />
              ))}
              <div className="bars">
                {bars.map((h, i) => (
                  <div className="bar-column" key={i}>
                    <div
                      className="bar"
                      style={{
                        height: `${chartMode === "Dokumen" ? h : Math.max(20, h - 10)}%`,
                      }}
                    >
                      <span>{h}%</span>
                    </div>
                    <small>
                      {
                        [
                          "Jul",
                          "Agu",
                          "Sep",
                          "Okt",
                          "Nov",
                          "Des",
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "Mei",
                          "Jun",
                        ][i]
                      }
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>
        <article className="panel status-panel">
          <div className="panel-header">
            <div>
              <h2>Status dokumen</h2>
              <p>Distribusi 1,284 dokumen</p>
            </div>
            <button className="card-menu">
              <Icon name="dots" />
            </button>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <div>
                <strong>1,284</strong>
                <span>Total</span>
              </div>
            </div>
          </div>
          <div className="legend">
            {[
              ["Approved", "642", "50%", "green"],
              ["Under Review", "231", "18%", "blue"],
              ["Draft", "205", "16%", "gray"],
              ["Revision", "129", "10%", "amber"],
              ["Overdue", "77", "6%", "red"],
            ].map((item) => (
              <div key={item[0]}>
                <span className={`legend-dot ${item[3]}`} />
                <b>{item[0]}</b>
                <strong>{item[1]}</strong>
                <small>{item[2]}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="work-grid">
        <article className="panel approval-panel">
          <div className="panel-header">
            <div>
              <h2>Menunggu persetujuan Anda</h2>
              <p>Dokumen yang perlu segera ditindaklanjuti</p>
            </div>
            <button
              className="text-link"
              onClick={() => setActive("Review & Approvals")}
            >
              Lihat semua <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="approval-list">
            {approvals.map((a, i) => (
              <div className="approval-row" key={a.name}>
                <div className={`file-tile ${a.tone}`}>
                  <Icon name="file" />
                </div>
                <div className="approval-info">
                  <strong>{a.name}</strong>
                  <span>{a.project}</span>
                </div>
                <div className={`mini-avatar ${a.tone}`}>{a.avatar}</div>
                <div className="owner">
                  <strong>{a.owner}</strong>
                  <span>{a.age}</span>
                </div>
                <span className="version">{a.version}</span>
                <div className="row-actions">
                  <button
                    className="review-btn"
                    onClick={() => alert(`${a.name} dibuka untuk review`)}
                  >
                    <Icon name="eye" size={15} />
                    Review
                  </button>
                  <button className="icon-btn">
                    <Icon name="dots" />
                  </button>
                </div>
                {i === 0 && <span className="urgent-mark">Prioritas</span>}
              </div>
            ))}
          </div>
        </article>
        <article className="panel deadline-panel">
          <div className="panel-header">
            <div>
              <h2>Deadline mendatang</h2>
              <p>7 hari ke depan</p>
            </div>
            <button
              className="text-link"
              onClick={() => setActive("Documents")}
            >
              Lihat semua
            </button>
          </div>
          <div className="deadline-list">
            {[
              [
                "20",
                "JUN",
                "SIT Report",
                "Core System Integration",
                "red",
                "2 hari",
              ],
              [
                "22",
                "JUN",
                "Deployment Plan",
                "Digital Lending Platform",
                "amber",
                "4 hari",
              ],
              [
                "24",
                "JUN",
                "API Specification",
                "Customer Data Platform",
                "blue",
                "6 hari",
              ],
            ].map((d) => (
              <div className="deadline-row" key={d[2]}>
                <div className={`date-box ${d[4]}`}>
                  <strong>{d[0]}</strong>
                  <span>{d[1]}</span>
                </div>
                <div>
                  <strong>{d[2]}</strong>
                  <span>{d[3]}</span>
                </div>
                <Badge tone={d[4]}>{d[5]}</Badge>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="bottom-grid">
        <article className="panel projects-panel">
          <div className="panel-header">
            <div>
              <h2>Kesiapan dokumentasi proyek</h2>
              <p>Proyek aktif berdasarkan kelengkapan dokumen wajib</p>
            </div>
            <button className="text-link" onClick={() => setActive("Projects")}>
              Semua proyek <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="compact-projects">
            {projects.slice(0, 4).map((p) => (
              <div key={p.code} className="compact-project">
                <div
                  className="project-symbol"
                  style={{ background: `${p.color}15`, color: p.color }}
                >
                  {p.name
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)}
                </div>
                <div className="compact-info">
                  <strong>{p.name}</strong>
                  <span>{p.docs} dokumen tersedia</span>
                </div>
                <div className="compact-progress">
                  <div>
                    <span>Kelengkapan</span>
                    <b>{p.progress}%</b>
                  </div>
                  <Progress value={p.progress} color={p.color} />
                </div>
                <Badge
                  tone={
                    p.status === "On Track"
                      ? "green"
                      : p.status === "At Risk"
                        ? "amber"
                        : "red"
                  }
                >
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </article>
        <article className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Aktivitas terbaru</h2>
              <p>Pembaruan dari workspace Anda</p>
            </div>
            <button className="icon-btn">
              <Icon name="dots" />
            </button>
          </div>
          <div className="activity-list">
            {activities.map((a) => (
              <div className="activity-row" key={a.text}>
                <div className={`activity-icon ${a.color}`}>
                  <Icon name={a.icon} size={15} />
                </div>
                <div>
                  <strong>{a.title}</strong>
                  <p>{a.text}</p>
                  <span>
                    {a.project} · {a.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

function ProjectsPage({
  query,
  openModal,
  rows,
  loading,
  error,
}: {
  query: string;
  openModal: () => void;
  rows: ProjectRow[];
  loading: boolean;
  error: string;
}) {
  const [status, setStatus] = useState("Semua status");
  const [selectedProject, setSelectedProject] = useState<ProjectRow | null>(
    null,
  );
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [projectRoles, setProjectRoles] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [memberFormLoading, setMemberFormLoading] = useState(false);

  async function loadMemberFormData() {
    const token = sessionStorage.getItem("docuflow_token");

    setMemberFormLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5100/api/projects/member-form-data",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat data anggota.");
      }

      setAvailableUsers(result.data?.users ?? []);
      setProjectRoles(result.data?.projectRoles ?? []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memuat data anggota.");
    } finally {
      setMemberFormLoading(false);
    }
  }

  async function addProjectMember() {
    if (!selectedProject || !selectedUserId || !selectedRoleId) {
      alert("Pilih user dan project role terlebih dahulu.");
      return;
    }

    const token = sessionStorage.getItem("docuflow_token");

    try {
      const response = await fetch(
        `http://localhost:5100/api/projects/${selectedProject.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: selectedUserId,
            projectRoleId: selectedRoleId,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menambahkan anggota.");
      }

      alert("Anggota proyek berhasil ditambahkan.");
      setShowAddMember(false);
      setSelectedUserId("");
      setSelectedRoleId("");
      await loadProjectMembers(selectedProject.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambahkan anggota.");
    }
  }

  async function updateProjectMember(userId: string, projectRoleId: string) {
    if (!selectedProject) return;

    const token = sessionStorage.getItem("docuflow_token");

    try {
      const response = await fetch(
        `http://localhost:5100/api/projects/${selectedProject.id}/members/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectRoleId }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengubah role anggota.");
      }

      await loadProjectMembers(selectedProject.id);
      alert("Role anggota berhasil diperbarui.");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Gagal mengubah role anggota.",
      );
    }
  }

  async function removeProjectMember(userId: string) {
    if (!selectedProject) return;

    if (!window.confirm("Yakin ingin menghapus anggota ini dari proyek?")) {
      return;
    }

    const token = sessionStorage.getItem("docuflow_token");

    try {
      const response = await fetch(
        `http://localhost:5100/api/projects/${selectedProject.id}/members/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus anggota.");
      }

      await loadProjectMembers(selectedProject.id);
      alert("Anggota berhasil dihapus.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus anggota.");
    }
  }

  const [isAdmin] = useState(() => {
    const user = JSON.parse(sessionStorage.getItem("docuflow_user") || "{}");
    return user.role === "System Administrator";
  });

  async function loadProjectMembers(projectId: string) {
    const token = sessionStorage.getItem("docuflow_token");

    setMembersLoading(true);
    setMembersError("");

    try {
      const response = await fetch(
        `http://localhost:5100/api/projects/${projectId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal memuat anggota proyek.");
      }

      // Backend bisa mengirim camelCase atau PascalCase; samakan agar tabel terisi.
      setMembers(
        (result.data ?? []).map((m: any) => ({
          ProjectMemberId: m.ProjectMemberId ?? m.projectMemberId,
          UserId: m.UserId ?? m.userId,
          FullName: m.FullName ?? m.fullName,
          Email: m.Email ?? m.email,
          Department: m.Department ?? m.department,
          ProjectRoleId: m.ProjectRoleId ?? m.projectRoleId,
          ProjectRoleName: m.ProjectRoleName ?? m.projectRoleName,
        })),
      );
    } catch (err) {
      setMembersError(
        err instanceof Error ? err.message : "Gagal memuat anggota proyek.",
      );
    } finally {
      setMembersLoading(false);
    }
  }

  const statuses = Array.from(new Set(rows.map((p) => p.status)));

  const filtered = rows.filter(
    (p) =>
      (p.name + p.code + p.manager)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "Semua status" || p.status === status),
  );

  const activeCount = rows.filter(
    (p) => p.status === "Planning" || p.status === "In Progress",
  ).length;
  const attentionCount = rows.filter(
    (p) => p.status === "On Hold" || p.status === "Cancelled",
  ).length;
  const completedCount = rows.filter((p) => p.status === "Completed").length;

  const projectColors = ["#4f46e5", "#0891b2", "#7c3aed", "#db2777", "#059669"];

  const statusTone = (value: string) =>
    value === "Completed"
      ? "green"
      : value === "In Progress"
        ? "blue"
        : value === "On Hold"
          ? "amber"
          : value === "Cancelled"
            ? "red"
            : "neutral";

  const initials = (value: string, max = 2) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0])
      .join("")
      .slice(0, max)
      .toUpperCase();

  const formatDate = (value: string) => {
    if (!value || value === "-") return "-";
    const date = value.split("T")[0];
    return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID");
  };

  const openDetail = (project: ProjectRow) => {
    setSelectedProject(project);
    loadProjectMembers(project.id);
    if (isAdmin) loadMemberFormData(); // daftar role untuk dropdown di tabel
  };

  if (selectedProject) {
    const availableToAdd = availableUsers.filter(
      (user) =>
        !members.some(
          (member) =>
            (member.UserId ?? member.userId) === (user.UserId ?? user.userId),
        ),
    );

    return (
      <div className="page list-page">
        <section className="page-heading">
          <div>
            <span className="eyebrow">DETAIL PROYEK</span>
            <h1>{selectedProject.name}</h1>
            <p>Informasi dan pengelolaan anggota proyek.</p>
          </div>
          <button
            className="btn secondary"
            onClick={() => setSelectedProject(null)}
          >
            Kembali ke Projects
          </button>
        </section>

        <section className="summary-strip">
          <div>
            <span>Kode proyek</span>
            <strong>{selectedProject.code}</strong>
          </div>
          <div>
            <span>Project Manager</span>
            <strong>{selectedProject.manager}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>
              <Badge tone={statusTone(selectedProject.status)}>
                {selectedProject.status}
              </Badge>
            </strong>
          </div>
          <div>
            <span>Target selesai</span>
            <strong>{formatDate(selectedProject.due)}</strong>
          </div>
        </section>

        <section className="panel detail-panel">
          <div className="panel-header">
            <div>
              <h2>Kelengkapan Dokumen</h2>
              <p>Progres pemenuhan dokumen wajib berdasarkan template SDLC.</p>
            </div>
            <strong>{selectedProject.progress}%</strong>
          </div>

          <Progress value={selectedProject.progress} />

          <p>
            {selectedProject.uploadedRequiredDocumentCount} dari{" "}
            {selectedProject.requiredDocumentCount} dokumen wajib telah
            diunggah.
          </p>
        </section>

        <section className="panel detail-panel">
          <div className="panel-header">
            <div>
              <h2>Informasi Proyek</h2>
              <p>Ringkasan data utama proyek.</p>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Jenis proyek</dt>
              <dd>{selectedProject.type || "-"}</dd>
            </div>
            <div>
              <dt>Tanggal mulai</dt>
              <dd>{formatDate(selectedProject.startDate)}</dd>
            </div>
            <div className="span-2">
              <dt>Deskripsi</dt>
              <dd>{selectedProject.description || "-"}</dd>
            </div>
          </dl>
        </section>

        <section className="panel table-panel">
          <div className="table-toolbar toolbar-title">
            <div>
              <h2>Project Members</h2>
              <p>
                {isAdmin
                  ? "Daftar anggota yang terdaftar dalam proyek ini."
                  : "Hanya Administrator yang dapat mengelola anggota proyek."}
              </p>
            </div>
            {isAdmin && (
              <button
                className="btn primary small"
                onClick={() => {
                  setShowAddMember(true);
                  loadMemberFormData();
                }}
              >
                <Icon name="plus" />
                Add Member
              </button>
            )}
          </div>

          <div className="data-table-wrap">
            {membersLoading ? (
              <div className="empty-state">
                <strong>Memuat anggota proyek...</strong>
              </div>
            ) : membersError ? (
              <div className="empty-state">
                <Icon name="alert" size={28} />
                <strong>Gagal memuat anggota</strong>
                <span>{membersError}</span>
              </div>
            ) : members.length === 0 ? (
              <div className="empty-state">
                <Icon name="users" size={28} />
                <strong>Belum ada anggota proyek</strong>
                <span>Anggota yang ditambahkan akan tampil di sini.</span>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>NAMA</th>
                    <th>EMAIL</th>
                    <th>DEPARTEMEN</th>
                    <th>PROJECT ROLE</th>
                    {isAdmin && <th>AKSI</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.ProjectMemberId}>
                      <td>
                        <div className="person-cell">
                          <div className="mini-avatar blue">
                            {initials(member.FullName ?? "")}
                          </div>
                          <strong className="person-name">
                            {member.FullName}
                          </strong>
                        </div>
                      </td>
                      <td>{member.Email}</td>
                      <td>{member.Department || "-"}</td>
                      <td>
                        <Badge tone="blue">{member.ProjectRoleName}</Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="row-actions">
                            <select
                              aria-label="Ubah project role"
                              defaultValue={member.ProjectRoleId}
                              onChange={(e) =>
                                updateProjectMember(
                                  member.UserId,
                                  e.target.value,
                                )
                              }
                            >
                              {projectRoles.map((role) => (
                                <option
                                  key={role.ProjectRoleId ?? role.projectRoleId}
                                  value={
                                    role.ProjectRoleId ?? role.projectRoleId
                                  }
                                >
                                  {role.ProjectRoleName ?? role.projectRoleName}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn secondary small danger"
                              onClick={() => removeProjectMember(member.UserId)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {showAddMember && isAdmin && (
          <div
            className="modal-layer"
            role="dialog"
            aria-modal="true"
            aria-label="Tambah anggota proyek"
          >
            <button
              type="button"
              className="modal-backdrop"
              aria-label="Tutup formulir"
              onClick={() => setShowAddMember(false)}
            />
            <div className="modal data-modal">
              <div className="modal-header">
                <div>
                  <span className="eyebrow">PROJECT MEMBERS</span>
                  <h2>Tambah Anggota Proyek</h2>
                  <p>Pilih pengguna dan tentukan perannya di proyek ini.</p>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowAddMember(false)}
                >
                  <Icon name="close" />
                </button>
              </div>

              <div className="member-form">
                {memberFormLoading ? (
                  <div className="empty-state compact">
                    <strong>Memuat data...</strong>
                  </div>
                ) : (
                  <div className="form-grid">
                    <label className="span-2">
                      <span>Pilih user</span>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                      >
                        <option value="">-- Pilih User --</option>
                        {availableToAdd.map((user) => (
                          <option
                            key={user.UserId ?? user.userId}
                            value={user.UserId ?? user.userId}
                          >
                            {user.FullName ?? user.fullName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="span-2">
                      <span>Project role</span>
                      <select
                        value={selectedRoleId}
                        onChange={(e) => setSelectedRoleId(e.target.value)}
                      >
                        <option value="">-- Pilih Role --</option>
                        {projectRoles.map((role) => (
                          <option
                            key={role.ProjectRoleId ?? role.projectRoleId}
                            value={role.ProjectRoleId ?? role.projectRoleId}
                          >
                            {role.ProjectRoleName ?? role.projectRoleName}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>

              <div className="modal-actions member-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowAddMember(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn primary"
                  onClick={addProjectMember}
                  disabled={!selectedUserId || !selectedRoleId}
                >
                  Simpan Anggota
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page list-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">PORTFOLIO PROYEK</span>
          <h1>Projects</h1>
          <p>
            Kelola proyek, anggota, timeline, dan kesiapan dokumentasi SDLC.
          </p>
        </div>
        <button className="btn primary" onClick={openModal}>
          <Icon name="plus" />
          Proyek baru
        </button>
      </section>

      <section className="summary-strip">
        <div>
          <span>Total proyek</span>
          <strong>{rows.length}</strong>
        </div>
        <div>
          <span>Aktif</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Ditahan / dibatalkan</span>
          <strong className="amber-text">{attentionCount}</strong>
        </div>
        <div>
          <span>Selesai</span>
          <strong>{completedCount}</strong>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Icon name="search" size={16} />
            <input value={query} readOnly placeholder="Cari proyek..." />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Semua status</option>
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button
            className="btn secondary small"
            onClick={() => setStatus("Semua status")}
          >
            <Icon name="filter" />
            Filter
          </button>
          <button className="btn secondary small">
            <Icon name="download" />
            Export
          </button>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>PROYEK</th>
                <th>PROJECT MANAGER</th>
                <th>KELENGKAPAN DOKUMEN</th>
                <th>STATUS</th>
                <th>TARGET SELESAI</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, index) => {
                const color = projectColors[index % projectColors.length];
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="project-cell">
                        <div
                          className="project-symbol"
                          style={{ background: `${color}15`, color }}
                        >
                          {initials(p.name)}
                        </div>
                        <div>
                          <strong>{p.name}</strong>
                          <span>{p.code}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="person-cell">
                        <div className="mini-avatar blue">
                          {initials(p.manager)}
                        </div>
                        {p.manager}
                      </div>
                    </td>
                    <td>
                      <div className="table-progress">
                        <div>
                          <Progress value={p.progress} color={color} />
                          <b>{p.progress}%</b>
                        </div>
                        <span>
                          {p.uploadedRequiredDocumentCount} dari{" "}
                          {p.requiredDocumentCount} dokumen wajib
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </td>
                    <td>{p.due}</td>
                    <td>
                      <button
                        className="icon-btn"
                        aria-label={`Detail ${p.name}`}
                        title="Lihat detail proyek"
                        onClick={() => openDetail(p)}
                      >
                        <Icon name="arrow" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {loading && (
            <div className="empty-state">
              <strong>Memuat data proyek...</strong>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <Icon name="alert" size={28} />
              <strong>Gagal memuat proyek</strong>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state">
              <Icon name={rows.length === 0 ? "folder" : "search"} size={28} />
              <strong>
                {rows.length === 0
                  ? "Belum ada proyek"
                  : "Proyek tidak ditemukan"}
              </strong>
              <span>
                {rows.length === 0
                  ? "Klik Proyek baru untuk menambahkan proyek."
                  : "Coba gunakan kata kunci atau filter lain."}
              </span>
            </div>
          )}
        </div>

        <div className="pagination">
          <span>
            Menampilkan {filtered.length} dari {rows.length} proyek
          </span>
          <div>
            <button disabled>‹</button>
            <button className="current">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const moduleData: Record<
  string,
  {
    eyebrow: string;
    title: string;
    description: string;
    icon: IconName;
    action: string;
    columns: string[];
  }
> = {
  Documents: {
    eyebrow: "DOCUMENT REPOSITORY",
    title: "Documents",
    description: "Temukan dan kelola seluruh dokumen SDLC dalam satu tempat.",
    icon: "file",
    action: "Upload dokumen",
    columns: ["NAMA DOKUMEN", "PROYEK", "FASE SDLC", "VERSI", "STATUS"],
  },
  "Review & Approvals": {
    eyebrow: "GOVERNANCE QUEUE",
    title: "Review & Approvals",
    description: "Tinjau dokumen dan putuskan approval secara tertelusur.",
    icon: "stamp",
    action: "Tindakan approval",
    columns: ["DOKUMEN", "PEMILIK", "TAHAP WORKFLOW", "DIAJUKAN", "AKSI"],
  },
  Administration: {
    eyebrow: "SYSTEM CONFIGURATION",
    title: "Administration",
    description: "Atur pengguna, hak akses, template SDLC, dan workflow.",
    icon: "settings",
    action: "Tambah konfigurasi",
    columns: ["KONFIGURASI", "DESKRIPSI", "ITEM AKTIF", "DIPERBARUI", "AKSI"],
  },
};

type MasterRow = {
  id: number;
  values: string[];
};

type ReportRow = {
  id: number;
  name: string;
  scope: string;
  period: string;
  owner: string;
  format: string;
  status: string;
};

type ProjectRow = {
  id: string;
  code: string;
  name: string;
  description: string;
  type: string;
  manager: string;
  status: string;
  startDate: string;
  due: string;
  requiredDocumentCount: number;
  uploadedRequiredDocumentCount: number;
  uploadedDocumentCount: number;
  progress: number;
};

type ProjectApiRow = {
  projectId?: string;
  ProjectId?: string;
  projectCode?: string;
  ProjectCode?: string;
  projectName?: string;
  ProjectName?: string;
  description?: string;
  Description?: string;
  startDate?: string;
  StartDate?: string;
  endDate?: string;
  EndDate?: string;
  projectType?: string;
  ProjectType?: string;
  projectManager?: string;
  ProjectManager?: string;
  projectStatus?: string;
  ProjectStatus?: string;
  requiredDocumentCount?: number;
  RequiredDocumentCount?: number;
  uploadedRequiredDocumentCount?: number;
  UploadedRequiredDocumentCount?: number;
  uploadedDocumentCount?: number;
  UploadedDocumentCount?: number;
  progressPercentage?: number;
  ProgressPercentage?: number;
};

function MasterDataModal({
  name,
  onClose,
  onSave,
}: {
  name: string;
  onClose: () => void;
  onSave: (values: string[]) => void;
}) {
  const cfg = moduleData[name] ?? moduleData.Documents;
  const fields =
    name === "Documents"
      ? [
          [
            "title",
            "Judul dokumen",
            "text",
            "Contoh: Business Requirement Document",
          ],
          ["project", "Proyek", "select", ""],
          ["phase", "Fase SDLC", "phase", ""],
          ["version", "Versi awal", "text", "v1.0"],
          ["status", "Status", "status", ""],
        ]
      : name === "Administration"
        ? [
            ["title", "Nama konfigurasi", "text", "Contoh: Template Fintech"],
            ["description", "Deskripsi", "text", "Jelaskan fungsi konfigurasi"],
            ["items", "Jumlah item aktif", "number", "1"],
            ["updated", "Tanggal berlaku", "date", ""],
            ["status", "Status", "active", ""],
          ]
        : [
            ["title", "Nama dokumen", "text", "Contoh: UAT Sign-Off"],
            ["owner", "Pemilik dokumen", "text", "Nama pemilik"],
            ["workflow", "Tahap workflow", "workflow", ""],
            ["submitted", "Tanggal diajukan", "date", ""],
            ["status", "Status", "approval", ""],
          ];

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = fields.map(([key]) => String(data.get(key) ?? ""));
    onSave(values);
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label={cfg.action}
    >
      <button className="modal-backdrop" onClick={onClose} />
      <div className="modal data-modal">
        <div className="modal-header">
          <div>
            <span className="eyebrow">MASTER DATA INPUT</span>
            <h2>{cfg.action}</h2>
            <p>Lengkapi seluruh informasi wajib sebelum menyimpan data.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <form onSubmit={submit}>
          <div className="form-grid">
            {fields.map(([key, label, type, placeholder], index) => (
              <label key={key} className={index === 0 ? "span-2" : ""}>
                <span>{label} *</span>
                {type === "select" ? (
                  <select name={key} required defaultValue="">
                    <option value="" disabled>
                      Pilih proyek
                    </option>
                    {projects.map((project) => (
                      <option key={project.code}>{project.name}</option>
                    ))}
                  </select>
                ) : type === "phase" ? (
                  <select name={key} required defaultValue="">
                    <option value="" disabled>
                      Pilih fase
                    </option>
                    <option>Project Initiation</option>
                    <option>Requirement Analysis</option>
                    <option>System Analysis & Design</option>
                    <option>Development</option>
                    <option>Testing</option>
                    <option>Deployment</option>
                    <option>Maintenance</option>
                  </select>
                ) : type === "status" ? (
                  <select name={key} required defaultValue="Draft">
                    <option>Draft</option>
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option>Approved</option>
                  </select>
                ) : type === "workflow" ? (
                  <select name={key} required defaultValue="Under Review">
                    <option>Submitted</option>
                    <option>Under Review</option>
                    <option>Pending Approval</option>
                    <option>Revision Required</option>
                  </select>
                ) : type === "approval" ? (
                  <select name={key} required defaultValue="Pending Approval">
                    <option>Under Review</option>
                    <option>Pending Approval</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                  </select>
                ) : type === "active" ? (
                  <select name={key} required defaultValue="Aktif">
                    <option>Aktif</option>
                    <option>Draft</option>
                    <option>Nonaktif</option>
                  </select>
                ) : (
                  <input
                    name={key}
                    type={type}
                    required
                    min={type === "number" ? 1 : undefined}
                    placeholder={placeholder}
                  />
                )}
              </label>
            ))}
            {name === "Documents" && (
              <label className="span-2">
                <span>File dokumen *</span>
                <input
                  name="file"
                  type="file"
                  required
                  accept=".pdf,.docx,.xlsx,.pptx"
                />
                <small className="field-help">
                  PDF, DOCX, XLSX, atau PPTX. Maksimal 25 MB.
                </small>
              </label>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose}>
              Batal
            </button>
            <button className="btn primary" type="submit">
              Simpan data <Icon name="check" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WorkflowAction({
  current,
  documentName,
  onChange,
}: {
  current: string;
  documentName: string;
  onChange: (status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const decisions = [
    {
      status: "Approved",
      title: "Approve document",
      description: "Dokumen memenuhi ketentuan dan dapat dilanjutkan.",
      icon: "check" as IconName,
      tone: "green",
    },
    {
      status: "Rejected",
      title: "Reject document",
      description: "Dokumen ditolak dan workflow akan dihentikan.",
      icon: "close" as IconName,
      tone: "red",
    },
    {
      status: "Revision Required",
      title: "Request revision",
      description: "Kembalikan dokumen kepada pemilik untuk diperbaiki.",
      icon: "alert" as IconName,
      tone: "amber",
    },
  ];

  return (
    <div className="workflow-action">
      <button className="decision-trigger" onClick={() => setOpen(true)}>
        <Icon name="stamp" size={14} />
        Tindak lanjut
      </button>
      {open && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label="Keputusan approval"
        >
          <button
            className="modal-backdrop"
            aria-label="Tutup keputusan approval"
            onClick={() => {
              setOpen(false);
              setSelected("");
            }}
          />
          <div className="modal decision-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">REVIEW DECISION</span>
                <h2>Tentukan keputusan dokumen</h2>
                <p>
                  {documentName} · Status saat ini: <strong>{current}</strong>
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={() => {
                  setOpen(false);
                  setSelected("");
                }}
              >
                <Icon name="close" />
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!selected) return;
                onChange(selected);
                setOpen(false);
                setSelected("");
              }}
            >
              <div className="decision-content">
                <span className="decision-label">Pilih keputusan *</span>
                <div className="decision-options">
                  {decisions.map((decision) => (
                    <button
                      type="button"
                      key={decision.status}
                      className={`decision-option decision-${decision.tone} ${
                        selected === decision.status ? "selected" : ""
                      }`}
                      onClick={() => setSelected(decision.status)}
                    >
                      <div>
                        <Icon name={decision.icon} size={17} />
                      </div>
                      <span>
                        <strong>{decision.title}</strong>
                        <small>{decision.description}</small>
                      </span>
                      <i>
                        {selected === decision.status && (
                          <Icon name="check" size={13} />
                        )}
                      </i>
                    </button>
                  ))}
                </div>
                <label className="decision-comment">
                  <span>
                    Komentar keputusan
                    {(selected === "Rejected" ||
                      selected === "Revision Required") &&
                      " *"}
                  </span>
                  <textarea
                    required={
                      selected === "Rejected" ||
                      selected === "Revision Required"
                    }
                    rows={3}
                    placeholder={
                      selected === "Approved"
                        ? "Tambahkan catatan approval (opsional)..."
                        : "Jelaskan alasan atau perbaikan yang diperlukan..."
                    }
                  />
                </label>
                <div className="decision-notice">
                  <Icon name="alert" size={14} />
                  Keputusan akan tercatat pada approval history dan activity
                  log.
                </div>
              </div>
              <div className="modal-actions decision-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setOpen(false);
                    setSelected("");
                  }}
                >
                  Batal
                </button>
                <button
                  className="btn primary"
                  type="submit"
                  disabled={!selected}
                >
                  Simpan keputusan
                  <Icon name="arrow" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ModulePage({
  name,
  rows,
  setRows,
}: {
  name: string;
  rows: MasterRow[];
  setRows: React.Dispatch<React.SetStateAction<MasterRow[]>>;
}) {
  const cfg = moduleData[name] ?? moduleData.Documents;
  const [modalOpen, setModalOpen] = useState(false);
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  async function loadProjects() {
    const token = sessionStorage.getItem("docuflow_token");

    if (!token) {
      setProjectsError("Token login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setProjectsLoading(true);
    setProjectsError("");

    try {
      const response = await fetch("http://localhost:5100/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data proyek.");
      }

      const data: ProjectApiRow[] = result.data ?? [];

      const mappedRows: ProjectRow[] = data.map((item, index) => {
        const endDate = item.endDate ?? item.EndDate;

        return {
          id: item.projectId ?? item.ProjectId ?? String(index),
          code: item.projectCode ?? item.ProjectCode ?? "-",
          name: item.projectName ?? item.ProjectName ?? "-",
          description: item.description ?? item.Description ?? "",
          type: item.projectType ?? item.ProjectType ?? "",
          manager: item.projectManager ?? item.ProjectManager ?? "-",
          status: item.projectStatus ?? item.ProjectStatus ?? "-",
          startDate: item.startDate ?? item.StartDate ?? "",
          due: endDate ? new Date(endDate).toLocaleDateString("id-ID") : "-",

          requiredDocumentCount:
            item.requiredDocumentCount ?? item.RequiredDocumentCount ?? 0,

          uploadedRequiredDocumentCount:
            item.uploadedRequiredDocumentCount ??
            item.UploadedRequiredDocumentCount ??
            0,

          uploadedDocumentCount:
            item.uploadedDocumentCount ?? item.UploadedDocumentCount ?? 0,

          progress: item.progressPercentage ?? item.ProgressPercentage ?? 0,
        };
      });

      setProjectRows(mappedRows);
    } catch (err) {
      setProjectsError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil proyek.",
      );
    } finally {
      setProjectsLoading(false);
    }
  }
  const [search, setSearch] = useState("");
  const filtered = rows.filter((row) =>
    row.values.join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="page list-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">{cfg.eyebrow}</span>
          <h1>{cfg.title}</h1>
          <p>{cfg.description}</p>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            if (name === "Review & Approvals") {
              document
                .querySelector(".module-table")
                ?.scrollIntoView({ behavior: "smooth" });
              return;
            }
            setModalOpen(true);
          }}
        >
          <Icon name={cfg.icon} />
          {cfg.action}
        </button>
      </section>
      <section className="module-feature">
        <div className="module-feature-icon">
          <Icon name={cfg.icon} size={25} />
        </div>
        <div>
          <span>Ringkasan hari ini</span>
          <strong>
            {name === "Documents"
              ? `${rows.length} dokumen tercatat di repository`
              : `Kelola ${rows.length} item ${cfg.title.toLowerCase()} secara terpusat`}
          </strong>
        </div>
        <button className="text-link">
          Lihat insight <Icon name="arrow" size={15} />
        </button>
      </section>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Icon name="search" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Cari di ${cfg.title.toLowerCase()}...`}
            />
          </label>
          <button className="btn secondary small">
            <Icon name="filter" />
            Filter
          </button>
          <button className="btn secondary small">
            <Icon name="download" />
            Export
          </button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table module-table">
            <thead>
              <tr>
                {cfg.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id}>
                  {cfg.columns.map((_, j) => (
                    <td key={j}>
                      {j === 0 ? (
                        <div className="project-cell">
                          <div className="file-tile blue">
                            <Icon name={cfg.icon} />
                          </div>
                          <strong>{row.values[j] ?? "Buka detail"}</strong>
                        </div>
                      ) : name === "Review & Approvals" &&
                        j === cfg.columns.length - 1 ? (
                        <WorkflowAction
                          current={row.values[j] ?? "Submitted"}
                          documentName={row.values[0] ?? "Dokumen"}
                          onChange={(status) =>
                            setRows((current) =>
                              current.map((item) =>
                                item.id === row.id
                                  ? {
                                      ...item,
                                      values: item.values.map((value, index) =>
                                        index === j
                                          ? status
                                          : index === 2
                                            ? status
                                            : value,
                                      ),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      ) : j === cfg.columns.length - 1 ? (
                        <Badge
                          tone={
                            row.values[j]?.includes("Revision") ||
                            row.values[j] === "Draft"
                              ? "amber"
                              : "green"
                          }
                        >
                          {row.values[j] ?? "Lihat"}
                        </Badge>
                      ) : (
                        (row.values[j] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {modalOpen && name !== "Review & Approvals" && (
        <MasterDataModal
          name={name}
          onClose={() => setModalOpen(false)}
          onSave={(values) => {
            setRows((current) => [{ id: Date.now(), values }, ...current]);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ReportsPage({
  rows,
  setRows,
}: {
  rows: ReportRow[];
  setRows: React.Dispatch<React.SetStateAction<ReportRow[]>>;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  function createReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setRows((current) => [
      {
        id: Date.now(),
        name: String(data.get("name")),
        scope: String(data.get("project")),
        period: String(data.get("period")),
        owner: "Arif Pranoto",
        format: String(data.get("format")),
        status: "Ready",
      },
      ...current,
    ]);
    setModalOpen(false);
  }

  return (
    <div className="page list-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">MANAGEMENT INSIGHT</span>
          <h1>Reports</h1>
          <p>
            Buat, jadwalkan, dan ekspor laporan tata kelola dokumentasi SDLC.
          </p>
        </div>
        <button className="btn primary" onClick={() => setModalOpen(true)}>
          <Icon name="plus" />
          Buat laporan
        </button>
      </section>
      <section className="report-templates">
        {[
          [
            "Documentation Readiness",
            "Kelengkapan dokumen wajib per proyek",
            "folder",
            "indigo",
          ],
          [
            "Approval Performance",
            "Durasi review dan tingkat approval",
            "stamp",
            "blue",
          ],
          [
            "SDLC Phase Completion",
            "Penyelesaian berdasarkan fase SDLC",
            "chart",
            "green",
          ],
          [
            "Overdue & Compliance",
            "Dokumen terlambat dan risiko kepatuhan",
            "alert",
            "amber",
          ],
        ].map((template) => (
          <button key={template[0]} onClick={() => setModalOpen(true)}>
            <div className={`report-icon ${template[3]}`}>
              <Icon name={template[2] as IconName} />
            </div>
            <strong>{template[0]}</strong>
            <span>{template[1]}</span>
            <small>
              Gunakan template <Icon name="arrow" size={12} />
            </small>
          </button>
        ))}
      </section>
      <section className="panel table-panel">
        <div className="panel-header report-history-header">
          <div>
            <h2>Riwayat laporan</h2>
            <p>Laporan yang telah dibuat dan siap diunduh</p>
          </div>
          <button className="btn secondary small">
            <Icon name="calendar" />
            Jadwal laporan
          </button>
        </div>
        <div className="data-table-wrap">
          <table className="data-table report-table">
            <thead>
              <tr>
                <th>NAMA LAPORAN</th>
                <th>CAKUPAN</th>
                <th>PERIODE</th>
                <th>DIBUAT OLEH</th>
                <th>FORMAT</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="project-cell">
                      <div className="file-tile blue">
                        <Icon name="chart" />
                      </div>
                      <div>
                        <strong>{row.name}</strong>
                        <span>{row.status}</span>
                      </div>
                    </div>
                  </td>
                  <td>{row.scope}</td>
                  <td>{row.period}</td>
                  <td>{row.owner}</td>
                  <td>
                    <span className="format-pill">{row.format}</span>
                  </td>
                  <td>
                    <button
                      className="review-btn"
                      onClick={() =>
                        alert(
                          `${row.name} siap diunduh dalam format ${row.format}`,
                        )
                      }
                    >
                      <Icon name="download" size={14} />
                      Unduh
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {modalOpen && (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <button
            className="modal-backdrop"
            onClick={() => setModalOpen(false)}
          />
          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">REPORT GENERATOR</span>
                <h2>Buat laporan baru</h2>
                <p>Pilih cakupan data dan format laporan yang dibutuhkan.</p>
              </div>
              <button className="icon-btn" onClick={() => setModalOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={createReport}>
              <div className="form-grid">
                <label className="span-2">
                  <span>Nama laporan *</span>
                  <input
                    name="name"
                    required
                    placeholder="Contoh: Monthly SDLC Compliance"
                  />
                </label>
                <label>
                  <span>Proyek *</span>
                  <select name="project" required defaultValue="Semua proyek">
                    <option>Semua proyek</option>
                    {projects.map((project) => (
                      <option key={project.code}>{project.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Periode *</span>
                  <select name="period" required defaultValue="Bulan ini">
                    <option>Bulan ini</option>
                    <option>Kuartal ini</option>
                    <option>Tahun ini</option>
                    <option>Custom period</option>
                  </select>
                </label>
                <label>
                  <span>Fase SDLC</span>
                  <select name="phase" defaultValue="Semua fase">
                    <option>Semua fase</option>
                    <option>Requirement Analysis</option>
                    <option>System Analysis & Design</option>
                    <option>Testing</option>
                    <option>Deployment</option>
                  </select>
                </label>
                <label>
                  <span>Status dokumen</span>
                  <select name="documentStatus" defaultValue="Semua status">
                    <option>Semua status</option>
                    <option>Draft</option>
                    <option>Under Review</option>
                    <option>Approved</option>
                    <option>Overdue</option>
                  </select>
                </label>
                <label className="span-2">
                  <span>Format output *</span>
                  <select name="format" required defaultValue="PDF">
                    <option>PDF</option>
                    <option>XLSX</option>
                  </select>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Batal
                </button>
                <button className="btn primary" type="submit">
                  Generate laporan <Icon name="chart" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

type ProjectFormData = {
  projectTypes: {
    projectTypeId: string;
    projectTypeName: string;
  }[];
  projectStatuses: {
    projectStatusId: string;
    projectStatusName: string;
  }[];
  projectManagers: {
    userId: string;
    fullName: string;
  }[];
  documentTemplates: {
    documentTemplateId: string;
    projectTypeId: string;
    templateName: string;
    versionNo: number;
  }[];
};

function ProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated?: () => void;
}) {
  const [selectedProjectTypeId, setSelectedProjectTypeId] = useState("");
  const [formData, setFormData] = useState<ProjectFormData>({
    projectTypes: [],
    projectStatuses: [],
    projectManagers: [],
    documentTemplates: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("docuflow_token");

    fetch("http://localhost:5100/api/projects/form-data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Gagal mengambil master data.");
        }

        console.log("Document Templates:", result.documentTemplates);

        setFormData({
          projectTypes: result.projectTypes ?? [],
          projectStatuses: result.projectStatuses ?? [],
          projectManagers: result.projectManagers ?? [],
          documentTemplates: result.documentTemplates ?? [],
        });
      })
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Gagal mengambil master data.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const data = new FormData(event.currentTarget);
    const token = sessionStorage.getItem("docuflow_token");

    try {
      const response = await fetch("http://localhost:5100/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectName: data.get("projectName"),
          projectCode: data.get("projectCode"),
          description: data.get("description"),
          projectTypeId: data.get("projectTypeId"),
          projectStatusId: data.get("projectStatusId"),
          projectManagerId: data.get("projectManagerId"),
          documentTemplateId: data.get("documentTemplateId"),
          startDate: data.get("startDate"),
          endDate: data.get("endDate"),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal membuat proyek.");
      }

      setSaved(true);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label="Buat proyek baru"
    >
      <button className="modal-backdrop" onClick={onClose} />
      <div className="modal">
        {saved ? (
          <div className="modal-success">
            <div>
              <Icon name="check" size={28} />
            </div>
            <h2>Proyek berhasil dibuat</h2>
            <p>Data proyek berhasil disimpan ke database.</p>
            <button className="btn primary" onClick={onClose}>
              Kembali ke dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <span className="eyebrow">PROJECT SETUP</span>
                <h2>Buat proyek baru</h2>
                <p>Lengkapi informasi dasar proyek.</p>
              </div>
              <button className="icon-btn" onClick={onClose}>
                <Icon name="close" />
              </button>
            </div>

            {loading ? (
              <p>Memuat master data...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label>
                    <span>Nama proyek *</span>
                    <input
                      name="projectName"
                      required
                      placeholder="Contoh: Mobile Banking Revamp"
                    />
                  </label>

                  <label>
                    <span>Kode proyek *</span>
                    <input
                      name="projectCode"
                      required
                      placeholder="PRJ-2026-001"
                    />
                  </label>

                  <label className="span-2">
                    <span>Deskripsi</span>
                    <textarea
                      name="description"
                      rows={3}
                      placeholder="Jelaskan tujuan dan ruang lingkup proyek..."
                    />
                  </label>

                  <label>
                    <span>Jenis proyek *</span>
                    <select
                      name="projectTypeId"
                      required
                      value={selectedProjectTypeId}
                      onChange={(event) => {
                        setSelectedProjectTypeId(event.target.value);
                        console.log(
                          "Selected Project Type:",
                          event.target.value,
                        );
                        const templateSelect =
                          event.currentTarget.form?.elements.namedItem(
                            "documentTemplateId",
                          ) as HTMLSelectElement | null;

                        if (templateSelect) {
                          templateSelect.value = "";
                        }
                      }}
                    >
                      <option value="" disabled>
                        Pilih jenis proyek
                      </option>
                      {formData.projectTypes.map((item) => (
                        <option
                          key={item.projectTypeId}
                          value={item.projectTypeId}
                        >
                          {item.projectTypeName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Status proyek *</span>
                    <select name="projectStatusId" required defaultValue="">
                      <option value="" disabled>
                        Pilih status proyek
                      </option>
                      {formData.projectStatuses.map((item) => (
                        <option
                          key={item.projectStatusId}
                          value={item.projectStatusId}
                        >
                          {item.projectStatusName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Project Manager *</span>
                    <select name="projectManagerId" required defaultValue="">
                      <option value="" disabled>
                        Pilih project manager
                      </option>
                      {formData.projectManagers.map((item) => (
                        <option key={item.userId} value={item.userId}>
                          {item.fullName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Document Template *</span>
                    <select
                      name="documentTemplateId"
                      required
                      defaultValue=""
                      disabled={!selectedProjectTypeId}
                    >
                      <option value="" disabled>
                        Pilih document template
                      </option>
                      {formData.documentTemplates
                        .filter(
                          (item) =>
                            item.projectTypeId === selectedProjectTypeId,
                        )
                        .map((item) => (
                          <option
                            key={item.documentTemplateId}
                            value={item.documentTemplateId}
                          >
                            {item.templateName} (v{item.versionNo})
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    <span>Tanggal mulai *</span>
                    <input name="startDate" type="date" required />
                  </label>

                  <label>
                    <span>Target selesai *</span>
                    <input name="endDate" type="date" required />
                  </label>
                </div>

                {error && (
                  <p role="alert" className="field-help">
                    {error}
                  </p>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={onClose}
                  >
                    Batal
                  </button>
                  <button
                    className="btn primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Menyimpan..." : "Buat proyek"}
                    {!saving && <Icon name="arrow" />}
                  </button>
                </div>
              </form>
            )}
            {error && loading && (
              <p role="alert" className="field-help">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type ManagedUser = {
  userId: string;
  fullName: string;
  email: string;
  department: string | null;
  isActive: boolean;
  primaryRole: string | null;
  roles: string[];
};

type AvailableRole = {
  roleId: string;
  roleName: string;
  description?: string | null;
};

function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<AvailableRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showForm, setShowForm] = useState(false);

  const token = sessionStorage.getItem("docuflow_token");
  const currentUser = JSON.parse(
    sessionStorage.getItem("docuflow_user") || "{}",
  );

  const permissions: string[] =
    currentUser.permissions ?? currentUser.Permissions ?? [];
  const canCreate =
    permissions.includes("USER_CREATE") && permissions.includes("ROLE_MANAGE");
  const canUpdate = permissions.includes("USER_UPDATE");
  const canManageRoles = permissions.includes("ROLE_MANAGE");
  const canDelete = permissions.includes("USER_DELETE");

  async function api(url: string, options: RequestInit = {}) {
    const response = await fetch(`http://localhost:5100${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || result.success === false) {
      throw new Error(result.message || `Request gagal (${response.status})`);
    }

    return result;
  }

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [userResult, roleResult] = await Promise.all([
        api("/api/users"),
        canManageRoles || permissions.includes("ROLE_VIEW")
          ? api("/api/users/available-roles")
          : Promise.resolve({ data: [] }),
      ]);

      setUsers(userResult.data ?? []);
      setRoles(roleResult.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengguna.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      (user.department ?? "").toLowerCase().includes(keyword) ||
      (user.primaryRole ?? "").toLowerCase().includes(keyword)
    );
  });

  async function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const roleIds = form.getAll("roleIds").map(String);
    const primaryRoleId = String(form.get("primaryRoleId") ?? "");

    if (!roleIds.length || !primaryRoleId || !roleIds.includes(primaryRoleId)) {
      alert("Pilih minimal satu role dan tentukan role utama.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        fullName: String(form.get("fullName") ?? ""),
        email: String(form.get("email") ?? ""),
        department: String(form.get("department") ?? ""),
        roleIds,
        primaryRoleId,
      };

      if (selectedUser) {
        await api(`/api/users/${selectedUser.userId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        await api(`/api/users/${selectedUser.userId}/roles`, {
          method: "PUT",
          body: JSON.stringify({ roleIds, primaryRoleId }),
        });
      } else {
        await api("/api/users", {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            password: String(form.get("password") ?? ""),
          }),
        });
      }

      setShowForm(false);
      setSelectedUser(null);
      await loadData();
      alert("Data pengguna berhasil disimpan.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan pengguna.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: ManagedUser) {
    if (!canUpdate) return;
    if (
      !confirm(
        `${user.isActive ? "Nonaktifkan" : "Aktifkan"} ${user.fullName}?`,
      )
    )
      return;

    try {
      await api(`/api/users/${user.userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status.");
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!canDelete) return;
    if (
      !confirm(
        `Hapus pengguna ${user.fullName}? Data akan dihapus secara soft delete.`,
      )
    )
      return;

    try {
      await api(`/api/users/${user.userId}`, { method: "DELETE" });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pengguna.");
    }
  }

  const activeCount = users.filter((user) => user.isActive).length;

  const initials = (value: string) =>
    value
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const closeForm = () => setShowForm(false);

  return (
    <div className="page list-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow">SYSTEM CONFIGURATION</span>
          <h1>Administration</h1>
          <p>Kelola pengguna, status akun, dan role akses DocuFlow.</p>
        </div>
        {canCreate && (
          <button
            className="btn primary"
            onClick={() => {
              setSelectedUser(null);
              setShowForm(true);
            }}
          >
            <Icon name="plus" />
            Tambah pengguna
          </button>
        )}
      </section>

      <section className="module-feature">
        <div className="module-feature-icon">
          <Icon name="settings" size={25} />
        </div>
        <div>
          <span>Users & Access</span>
          <strong>
            {users.length} pengguna terdaftar, {activeCount} aktif
          </strong>
        </div>
      </section>

      {error && <div className="inline-message error">{error}</div>}

      <section className="panel table-panel">
        <div className="table-toolbar">
          <label className="table-search">
            <Icon name="search" size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, email, departemen, role..."
            />
          </label>
        </div>

        <div className="data-table-wrap">
          <table className="data-table module-table">
            <thead>
              <tr>
                <th>PENGGUNA</th>
                <th>DEPARTEMEN</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <div className="project-cell">
                      <div className="mini-avatar blue">
                        {initials(user.fullName)}
                      </div>
                      <div>
                        <strong>{user.fullName}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.department || "-"}</td>
                  <td>
                    <div className="role-badges">
                      {(user.roles?.length
                        ? user.roles
                        : user.primaryRole
                          ? [user.primaryRole]
                          : []
                      ).map((role) => (
                        <Badge
                          key={role}
                          tone={role === user.primaryRole ? "blue" : "neutral"}
                        >
                          {role}
                        </Badge>
                      ))}
                      {!user.roles?.length && !user.primaryRole && "-"}
                    </div>
                  </td>
                  <td>
                    <Badge tone={user.isActive ? "green" : "red"}>
                      {user.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td>
                    <div className="row-actions">
                      {canUpdate && (
                        <button
                          className="btn secondary small"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </button>
                      )}
                      {canUpdate && (
                        <button
                          className="btn secondary small"
                          onClick={() => toggleStatus(user)}
                        >
                          {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn secondary small danger"
                          onClick={() => deleteUser(user)}
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="empty-state">
              <strong>Memuat data pengguna...</strong>
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="empty-state">
              <Icon name="users" size={28} />
              <strong>Pengguna tidak ditemukan</strong>
              <span>Coba gunakan kata kunci atau filter lain.</span>
            </div>
          )}
        </div>

        <div className="pagination">
          <span>
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </span>
          <div>
            <button disabled>‹</button>
            <button className="current">1</button>
            <button disabled>›</button>
          </div>
        </div>
      </section>

      {showForm && (
        <div
          className="modal-layer"
          role="dialog"
          aria-modal="true"
          aria-label={selectedUser ? "Edit pengguna" : "Tambah pengguna"}
        >
          <button
            type="button"
            className="modal-backdrop"
            onClick={closeForm}
          />
          <div className="modal data-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">USERS & ACCESS</span>
                <h2>{selectedUser ? "Edit pengguna" : "Tambah pengguna"}</h2>
                <p>Lengkapi informasi akun dan tentukan role akses pengguna.</p>
              </div>
              <button type="button" className="icon-btn" onClick={closeForm}>
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={saveUser}>
              <div className="form-grid">
                <label className="span-2">
                  <span>Nama lengkap *</span>
                  <input
                    name="fullName"
                    required
                    placeholder="Contoh: Arif Pranoto"
                    defaultValue={selectedUser?.fullName ?? ""}
                  />
                </label>

                <label>
                  <span>Email *</span>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="nama@perusahaan.com"
                    defaultValue={selectedUser?.email ?? ""}
                  />
                </label>

                <label>
                  <span>Departemen</span>
                  <input
                    name="department"
                    placeholder="Contoh: IT Delivery"
                    defaultValue={selectedUser?.department ?? ""}
                  />
                </label>

                {!selectedUser && (
                  <label className="span-2">
                    <span>Password awal *</span>
                    <input
                      name="password"
                      type="password"
                      minLength={8}
                      required
                      placeholder="Minimal 8 karakter"
                    />
                  </label>
                )}

                <label className="span-2">
                  <span>Role pengguna *</span>
                  <select
                    name="roleIds"
                    multiple
                    required
                    defaultValue={
                      selectedUser
                        ? roles
                            .filter((role) =>
                              selectedUser.roles.includes(role.roleName),
                            )
                            .map((role) => role.roleId)
                        : []
                    }
                  >
                    {roles.map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                  <small className="field-help">
                    Gunakan Ctrl (Windows) untuk memilih beberapa role.
                  </small>
                </label>

                <label className="span-2">
                  <span>Role utama *</span>
                  <select
                    name="primaryRoleId"
                    required
                    defaultValue={
                      roles.find(
                        (role) => role.roleName === selectedUser?.primaryRole,
                      )?.roleId ?? ""
                    }
                  >
                    <option value="">Pilih role utama</option>
                    {roles.map((role) => (
                      <option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                  <small className="field-help">
                    Role utama harus termasuk salah satu role yang dicentang.
                  </small>
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Batal
                </button>
                <button className="btn primary" type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan data"}
                  {!saving && <Icon name="check" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("http://localhost:5100/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });

      const result = await response.json();
      console.log("LOGIN USER:", result.user);

      if (!response.ok || !result.success) {
        alert(result.message || "Login gagal.");
        return;
      }

      sessionStorage.setItem("docuflow_token", result.token);
      sessionStorage.setItem("docuflow_user", JSON.stringify(result.user));

      onLogin();
    } catch {
      alert("Tidak dapat terhubung ke server. Pastikan backend berjalan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-showcase">
        <div className="login-brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>DocuFlow</strong>
            <small>SDLC Governance</small>
          </div>
        </div>
        <div className="showcase-copy">
          <span className="login-kicker">
            <span />
            ENTERPRISE DOCUMENT GOVERNANCE
          </span>
          <h1>
            Setiap dokumen.
            <br />
            Setiap keputusan.
            <br />
            <em>Tertelusur.</em>
          </h1>
          <p>
            Kelola seluruh siklus dokumentasi SDLC, dari requirement hingga
            deployment, dalam satu workspace yang aman dan terstruktur.
          </p>
          <div className="login-benefits">
            <div>
              <Icon name="check" />
              <span>Kontrol versi & audit trail</span>
            </div>
            <div>
              <Icon name="stamp" />
              <span>Workflow approval terpusat</span>
            </div>
            <div>
              <Icon name="share" />
              <span>Audit trail end-to-end</span>
            </div>
          </div>
        </div>
        <div className="showcase-preview">
          <div className="preview-top">
            <div>
              <span>Documentation readiness</span>
              <strong>76.4%</strong>
            </div>
            <Badge tone="green">+6.8% bulan ini</Badge>
          </div>
          <div className="preview-chart">
            {[36, 48, 43, 59, 55, 69, 66, 80, 76, 88, 84, 94].map(
              (height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ),
            )}
          </div>
          <div className="preview-stats">
            <div>
              <span>Proyek aktif</span>
              <strong>24</strong>
            </div>
            <div>
              <span>Dokumen disetujui</span>
              <strong>642</strong>
            </div>
            <div>
              <span>Pending review</span>
              <strong>38</strong>
            </div>
          </div>
        </div>
        <p className="login-copyright">
          © 2025 Nusantara Tech · Secure enterprise workspace
        </p>
      </section>

      <section className="login-form-side">
        <div className="mobile-login-brand login-brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>DocuFlow</strong>
            <small>SDLC Governance</small>
          </div>
        </div>
        <div className="login-form-wrap">
          <div className="login-heading">
            <span className="eyebrow">WELCOME BACK</span>
            <h2>Masuk ke workspace</h2>
            <p>Gunakan akun perusahaan Anda untuk melanjutkan.</p>
          </div>
          <form className="login-form" onSubmit={submit}>
            <label>
              <span>Email perusahaan</span>
              <div className="login-input">
                <Icon name="mail" size={17} />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  defaultValue="admin@docuflow.local"
                  placeholder="nama@perusahaan.com"
                />
              </div>
            </label>
            <label>
              <div className="password-label">
                <span>Password</span>
                <button type="button">Lupa password?</button>
              </div>
              <div className="login-input">
                <Icon name="lock" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  defaultValue="Admin123!"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  <Icon name="eye" size={17} />
                </button>
              </div>
            </label>
            <label className="remember-row">
              <input type="checkbox" defaultChecked />
              <span>Ingat saya di perangkat ini</span>
            </label>
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Memverifikasi akun...
                </>
              ) : (
                <>
                  Masuk ke dashboard
                  <Icon name="arrow" size={17} />
                </>
              )}
            </button>
          </form>
          <div className="login-divider">
            <span />
            <small>AKSES AMAN</small>
            <span />
          </div>
          <div className="security-note">
            <Icon name="lock" size={15} />
            <p>
              Sesi Anda dilindungi dengan enkripsi. Hubungi administrator jika
              mengalami kendala akses.
            </p>
          </div>
        </div>
        <div className="login-footer">
          <button>Bantuan</button>
          <span>·</span>
          <button>Kebijakan privasi</button>
          <span>·</span>
          <button>Bahasa Indonesia</button>
        </div>
      </section>
    </main>
  );
}

// Sesi hanya valid jika token ada dan (bila berformat JWT) belum kedaluwarsa.
function hasValidSession() {
  // Bersihkan sesi lama yang dulu disimpan di localStorage.
  localStorage.removeItem("docuflow_token");
  localStorage.removeItem("docuflow_user");

  const token = sessionStorage.getItem("docuflow_token");
  if (!token) return false;

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      sessionStorage.removeItem("docuflow_token");
      sessionStorage.removeItem("docuflow_user");
      return false;
    }
  } catch {
    // Bukan JWT: anggap valid selama token ada.
  }
  return true;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(hasValidSession);
  const [active, setActive] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [projectRows, setProjectRows] = useState<ProjectRow[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  async function loadProjects() {
    const token = sessionStorage.getItem("docuflow_token");

    if (!token) {
      setProjectsError("Token login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setProjectsLoading(true);
    setProjectsError("");

    try {
      const response = await fetch("http://localhost:5100/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengambil data proyek.");
      }

      const data: ProjectApiRow[] = result.data ?? [];

      const mappedRows: ProjectRow[] = data.map((item, index) => {
        const endDate = item.endDate ?? item.EndDate;

        return {
          id: item.projectId ?? item.ProjectId ?? String(index),
          code: item.projectCode ?? item.ProjectCode ?? "-",
          name: item.projectName ?? item.ProjectName ?? "-",
          description: item.description ?? item.Description ?? "",
          type: item.projectType ?? item.ProjectType ?? "",
          manager: item.projectManager ?? item.ProjectManager ?? "-",
          status: item.projectStatus ?? item.ProjectStatus ?? "-",
          startDate: item.startDate ?? item.StartDate ?? "",
          due: endDate ? new Date(endDate).toLocaleDateString("id-ID") : "-",

          requiredDocumentCount:
            item.requiredDocumentCount ?? item.RequiredDocumentCount ?? 0,

          uploadedRequiredDocumentCount:
            item.uploadedRequiredDocumentCount ??
            item.UploadedRequiredDocumentCount ??
            0,

          uploadedDocumentCount:
            item.uploadedDocumentCount ?? item.UploadedDocumentCount ?? 0,

          progress: item.progressPercentage ?? item.ProgressPercentage ?? 0,
        };
      });

      setProjectRows(mappedRows);
    } catch (err) {
      setProjectsError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil proyek.",
      );
    } finally {
      setProjectsLoading(false);
    }
  }
  const [documentRows, setDocumentRows] = useState<MasterRow[]>([
    {
      id: 1,
      values: [
        "Business Requirement Document",
        "Mobile Banking Revamp",
        "Requirement Analysis",
        "v1.4",
        "Approved",
      ],
    },
    {
      id: 2,
      values: [
        "Technical Specification",
        "Customer Data Platform",
        "System Analysis & Design",
        "v2.0",
        "Under Review",
      ],
    },
    {
      id: 3,
      values: [
        "Deployment Plan",
        "Digital Lending Platform",
        "Deployment",
        "v1.0",
        "Draft",
      ],
    },
  ]);
  const [approvalRows, setApprovalRows] = useState<MasterRow[]>([
    {
      id: 1,
      values: [
        "UAT Sign-Off",
        "Nadia P.",
        "Pending Approval",
        "18 Jun 2025",
        "Pending Approval",
      ],
    },
    {
      id: 2,
      values: [
        "Technical Specification",
        "Andi W.",
        "Under Review",
        "18 Jun 2025",
        "Under Review",
      ],
    },
    {
      id: 3,
      values: [
        "Deployment Plan",
        "Sinta K.",
        "Revision Required",
        "17 Jun 2025",
        "Revision Required",
      ],
    },
  ]);
  const [adminRows, setAdminRows] = useState<MasterRow[]>([
    {
      id: 1,
      values: [
        "Users & Access",
        "Kelola pengguna dan status akses",
        "142 pengguna",
        "Hari ini",
        "Aktif",
      ],
    },
    {
      id: 2,
      values: [
        "Roles & Permissions",
        "Kontrol akses berbasis peran",
        "9 peran",
        "2 hari lalu",
        "Aktif",
      ],
    },
    {
      id: 3,
      values: [
        "SDLC Templates",
        "Template fase dan dokumen wajib",
        "6 template",
        "5 hari lalu",
        "Aktif",
      ],
    },
    {
      id: 4,
      values: [
        "Workflow Configuration",
        "Tahap review dan approval",
        "12 workflow",
        "1 minggu lalu",
        "Aktif",
      ],
    },
  ]);
  const [reportRows, setReportRows] = useState<ReportRow[]>([
    {
      id: 1,
      name: "Monthly Documentation Readiness",
      scope: "Semua proyek",
      period: "Mei 2025",
      owner: "Arif Pranoto",
      format: "PDF",
      status: "Ready",
    },
    {
      id: 2,
      name: "Approval Performance Q2",
      scope: "Mobile Banking Revamp",
      period: "Q2 2025",
      owner: "Maya Putri",
      format: "XLSX",
      status: "Ready",
    },
    {
      id: 3,
      name: "Overdue Compliance Report",
      scope: "Semua proyek",
      period: "Juni 2025",
      owner: "Arif Pranoto",
      format: "PDF",
      status: "Ready",
    },
  ]);

  const content = useMemo(() => {
    if (active === "Dashboard") {
      return (
        <Dashboard setActive={setActive} openModal={() => setModalOpen(true)} />
      );
    }

    if (active === "Projects") {
      return (
        <ProjectsPage
          query={query}
          openModal={() => setModalOpen(true)}
          rows={projectRows}
          loading={projectsLoading}
          error={projectsError}
        />
      );
    }

    if (active === "Reports") {
      return <ReportsPage rows={reportRows} setRows={setReportRows} />;
    }

    if (active === "Administration") {
      return <AdministrationPage usersContent={<UsersPage />} />;
    }

    if (active === "Review & Approvals") {
      return <ReviewApprovalsPage />;
    }

    return <DocumentsPage />;
  }, [
    active,
    query,
    documentRows,
    approvalRows,
    reportRows,
    projectRows,
    projectsLoading,
    projectsError,
  ]);

  useEffect(() => {
    if (isLoggedIn) void loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      void loadProjects();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, active]);

  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setActive("Dashboard");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
      />
      <main className="main">
        <Topbar
          active={active}
          onMenu={() => setSidebarOpen(true)}
          onSearch={(v) => {
            setQuery(v);
            if (v && active === "Dashboard") setActive("Projects");
          }}
          onLogout={() => {
            sessionStorage.removeItem("docuflow_token");
            sessionStorage.removeItem("docuflow_user");
            setIsLoggedIn(false);
          }}
        />
        {content}
      </main>
      {modalOpen && (
        <ProjectModal
          onClose={() => setModalOpen(false)}
          onCreated={loadProjects}
        />
      )}
    </div>
  );
}
