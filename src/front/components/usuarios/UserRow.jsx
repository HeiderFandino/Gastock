import React from 'react';
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";

const UserRow = ({ user }) => {
  return (
    <tr>
      <td>
        <div className="user-info-name">{user.name}</div>
        <div className="user-info-email">{user.email}</div>
      </td>
      <td>
        <span className={`badge ${user.role}`}>{user.role}</span>
      </td>
      <td>
        <span className={`badge ${user.status}`}>{user.status}</span>
      </td>
      <td>{user.restaurant}</td>
      <td>
        <div className="user-actions">
          <button title="Ver" aria-label="Ver"><FiEye size={18} aria-hidden="true" focusable="false" /></button>
          <button title="Edit"><FiEdit2 size={18} aria-hidden="true" focusable="false" /></button>
          <button className="delete" title="Delete"><FiTrash2 size={18} aria-hidden="true" focusable="false" /></button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
