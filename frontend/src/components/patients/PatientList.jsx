import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, User,Calendar } from 'lucide-react';
import dayjs from 'dayjs';

const PatientList = ({ patients, onEdit, onDelete, loading }) => {
  console.log("patients: ", patients)
  if (loading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading patients...</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <User size={48} className="empty-icon" />
          <h3>No patients found</h3>
          <p>Get started by adding your first patient.</p>
        </div>
      </div>
    );
  }

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>ID Number</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Contact</th>
            <th>Last Visit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.data.map(patient => (
            <tr key={patient.id}>
              <td>
                <div className="patient-info">
                  <div className="patient-avatar small">
                    {patient.first_name.charAt(0)}
                  </div>
                  <div>
                    <div className="patient-name">{patient.name}</div>
                    <div className="patient-id">ID: {patient.id}</div>
                  </div>
                </div>
              </td>
              <td>{patient.id_number}</td>
              <td>{calculateAge(patient.date_of_birth)}</td>
              <td>
                <span className={`gender-badge gender-${patient.gender.toLowerCase()}`}>
                  {patient.gender}
                </span>
              </td>
              <td>
                <div className="contact-info">
                  {patient.contact_phone}
                </div>
              </td>
              <td>
                {patient.last_visit_date ? (
                  <div className="last-visit">
                    <Calendar size={14} />
                    {dayjs(patient.last_visit_date).format('DD/MM/YY')}
                  </div>
                ) : (
                  <span className="text-muted">No visits</span>
                )}
              </td>
              <td>
                <span className={`status-badge status-${patient.status.toLowerCase()}`}>
                  {patient.status}
                </span>
              </td>
              <td>
  <div className="action-buttons">
    <Link 
      to={`/patients/${patient.id}`}
      className="btn-icon"
      title="View Profile"
    >
      <Eye size={16} />
    </Link>
    <button 
      className="btn-icon"
      onClick={() => onEdit(patient)}
      title="Edit Patient"
    >
      <Edit size={16} />
    </button>
    <button 
      className="btn-icon btn-danger"
      onClick={() => onDelete(patient.id)}
      title="Delete Patient"
    >
      <Trash2 size={16} />
    </button>
  </div>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientList;