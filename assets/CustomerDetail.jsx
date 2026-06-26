// src/components/CustomerDetail.jsx
import { useState, useEffect } from "react";
import Spinner from "./Spinner";
import styles from "./CustomerDetail.module.css";

const API_BASE = "http://localhost:3001";

function CustomerDetail({ selectedId, onUpdate }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setCustomer(null);
      return;
    }

    const fetchCustomer = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/customers/${selectedId}`);
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [selectedId]);

  const handleEditClick = () => {
    setEditForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || "",
      company: customer.company || "",
      notes: customer.notes || "",
      status: customer.status,
      tags: customer.tags,
    });
    setIsEditing(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(customer.id, editForm);
      setCustomer((prev) => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!selectedId) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Select a customer to view details.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.panel}>
        <Spinner size={8} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>Error: {error}</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className={styles.panel}>
      {isEditing ? (
        <form onSubmit={handleEditSubmit}>
          <h2 className={styles.name}>Edit customer</h2>

          <div className={styles.section}>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="firstName">First name</label>
              <input id="firstName" name="firstName" className={styles.input} value={editForm.firstName} onChange={handleEditChange} required />
            </div>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="lastName">Last name</label>
              <input id="lastName" name="lastName" className={styles.input} value={editForm.lastName} onChange={handleEditChange} required />
            </div>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className={styles.input} value={editForm.email} onChange={handleEditChange} required />
            </div>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="phone">Phone</label>
              <input id="phone" name="phone" className={styles.input} value={editForm.phone} onChange={handleEditChange} />
            </div>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="company">Company</label>
              <input id="company" name="company" className={styles.input} value={editForm.company} onChange={handleEditChange} />
            </div>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" className={styles.input} value={editForm.notes} onChange={handleEditChange} rows={3} />
            </div>
            <div className={styles.editField}>
              <label className={styles.sectionLabel} htmlFor="status">Status</label>
              <select id="status" name="status" className={styles.input} value={editForm.status} onChange={handleEditChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className={styles.editActions}>
            <button type="submit" className={styles.saveButton} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" className={styles.cancelButton} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.name}>{customer.firstName} {customer.lastName}</h2>
              {customer.company && <p className={styles.company}>{customer.company}</p>}
            </div>
            <button className={styles.editButton} onClick={handleEditClick}>Edit</button>
          </div>

          <div>
            <p className={styles.contactRow}>{customer.email}</p>
            {customer.phone && <p className={styles.contactRow}>{customer.phone}</p>}
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Status and tags</p>
            <div className={styles.tags}>
              <span className={`${styles.badge} ${customer.status === "active" ? styles.badgeActive : styles.badgeInactive}`}>
                {customer.status}
              </span>
              {customer.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Notes</p>
            {customer.notes ? (
              <p className={styles.notes}>{customer.notes}</p>
            ) : (
              <p className={styles.notesEmpty}>No notes yet.</p>
            )}
          </div>

          <div className={styles.section}>
            <p className={styles.sectionLabel}>Customer since</p>
            <p className={styles.contactRow}>{customer.createdAt}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerDetail;
