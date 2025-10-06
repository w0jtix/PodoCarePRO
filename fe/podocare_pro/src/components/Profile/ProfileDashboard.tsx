import { AvatarPicker } from "./AvatarPicker";
import AuthService from "../../services/AuthService";
import { AVAILABLE_AVATARS } from "../../constants/avatars";
import ActionButton from "../ActionButton";
import { useState, useEffect, useCallback } from "react";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { User, Role, JwtUser, RoleType } from "../../models/login";
import UserService from "../../services/UserService";
import EditUserPopup from "../Popups/EditUserPopup";
import RoleService from "../../services/RoleService";
import { AlertType } from "../../models/alert";
import { useAlert } from "../Alert/AlertProvider";
import { validateUpdateUser } from "../../utils/validators";
import { useUser } from "../User/UserProvider";
import DropdownSelect from "../DropdownSelect";
import EmployeeService from "../../services/EmployeeService";
import { Employee, NewEmployee } from "../../models/employee";
import { validateEmployeeForm } from "../../utils/validators";
import { Action } from "../../models/action";
import { extractEmployeesErrorMessage } from "../../utils/errorHandler";
import AddNewEmployeePopup from "../Popups/AddNewEmployeePopup";

export function ProfileDashboard() {
  const { user, setUser, refreshUser } = useUser();
  const { showAlert } = useAlert();

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [isForceChangePasswordPopupOpen, setIsForceChangePasswordPopupOpen] =
    useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      setUsers(response);
    } catch (err) {
      console.error("Błąd podczas pobierania użytkowników!", err);
    }
  };

  const fetchEmployees = async () => {
    EmployeeService.getAllEmployees()
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        setEmployees([]);
        console.error("Error fetching categories:", error);
      });
  };

  const handleEmployeeSelect = (value: Employee | Employee[] | null) => {
    setUpdatedUser((prev) => {
      if (!prev) return prev;

      const selectedEmployee = Array.isArray(value) ? value[0] : value;

      return {
        ...prev,
        employee: selectedEmployee,
      };
    });
  };

  const toggleAvatarPicker = () => {
    setIsAvatarPickerOpen((prev) => !prev);
  };

  const handleAvatarChange = (avatar: string) => {
    setUpdatedUser((prev) => {
      if (!prev) return prev;
      return { ...prev, avatar };
    });
    setIsAvatarPickerOpen(false);
  };

  const toggleRole = (role: Role) => {
    if (user?.roles.includes(RoleType.ROLE_ADMIN)) {
      setUpdatedUser((prev) => {
        if (!prev) return prev;
        const hasRole = prev.roles.some((r) => r.id === role.id);
        return {
          ...prev,
          roles: hasRole
            ? prev.roles.filter((r) => r.id !== role.id)
            : [...prev.roles, role],
        };
      });
    }
  };

  const handleForceChangePassword = () => {
    setIsForceChangePasswordPopupOpen((prev) => !prev);
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  const handleAddNewEmployee = useCallback(
    async (newEmployee: NewEmployee) => {
      const error = validateEmployeeForm(newEmployee, undefined, Action.CREATE);
      if (error) {
        showAlert(error, AlertType.ERROR);
        return null;
      }

      EmployeeService.createEmployee(newEmployee)
        .then((data) => {
          setUpdatedUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              employee: data,
            } as User;
          });
          showAlert("Pomyślnie utworzono pracownika.", AlertType.SUCCESS);
          fetchEmployees();
        })
        .catch((error) => {
          console.error("Error creating new Employee.", error);
          const errorMessage = extractEmployeesErrorMessage(
            error,
            Action.CREATE
          );
          showAlert(errorMessage, AlertType.ERROR);
        });
    },
    [showAlert]
  );

  const avatarSrc = updatedUser?.avatar
    ? AVAILABLE_AVATARS[updatedUser.avatar]
    : AVAILABLE_AVATARS["avatar1.png"];

  const handleValidateUpdatedUser = () => {
    if (!updatedUser) {
      showAlert("Brak danych użytkownika do aktualizacji!", AlertType.ERROR);
      return;
    }

    const error = validateUpdateUser(updatedUser, user);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }

    handleEditUser();
  };

  const handleEditUser = async () => {
    if (!updatedUser) return;

    try {
      const data = await UserService.updateUser(updatedUser.id, updatedUser);

      if (!data) {
        showAlert("Błąd aktualizacji - brak danych!", AlertType.ERROR);
        return;
      }

      AuthService.setCurrentUser(data);
      refreshUser();

      await fetchUsers();

      showAlert(
        `Użytkownik ${updatedUser.username} zaktualizowany!`,
        AlertType.SUCCESS
      );
    } catch (error) {
      showAlert("Błąd aktualizacji!", AlertType.ERROR);
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await RoleService.getAllRoles();
        setAvailableRoles(response);

        const jwtUser = AuthService.getCurrentUser() as JwtUser;

        const mappedRoles = response.filter((role: Role) =>
          jwtUser.roles.includes(role.name)
        );
        setUpdatedUser({
          id: jwtUser.id,
          username: jwtUser.username,
          avatar: jwtUser.avatar,
          roles: mappedRoles,
          employee: jwtUser.employee,
        });
      } catch (err) {
        console.error("Błąd podczas pobierania roli!", err);
      }
    };

    fetchUsers();
    fetchRoles();
    fetchEmployees();
    refreshUser();
  }, []);

  return (
    <div className="dashboard-panel">
      <div className="user-container">
        <div className="user-basic-info">
          <div className="profile-container">
            <div className="pfp">
              <h2 className="h2-username">{user?.username}</h2>
              <div className="profile-avatar">
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="profile-avatar-image"
                />
              </div>
              <ActionButton
                text={"Wybierz Avatar"}
                disableImg={true}
                onClick={toggleAvatarPicker}
                className="avatar-button"
              />
            </div>
            <div className="user-roles-container">
              <h2 className="pw-header role">Role Użytkownika</h2>
              {availableRoles.map((role) => (
                <ActionButton
                  text={role.name.replace("ROLE_", "")}
                  disableImg={true}
                  onClick={() => toggleRole(role)}
                  className={`role-button ${
                    updatedUser?.roles.some((r) => r.id === role.id)
                      ? "selected"
                      : ""
                  }`}
                  key={role.id}
                />
              ))}
            </div>
          </div>
          {user?.roles.includes(RoleType.ROLE_ADMIN) ? (
            <div className="user-details-bottom-section">
              <div className="employee-dropdown-container">
              <h2 className="pw-header role popup">Pracownik:</h2>
              <DropdownSelect
                items={employees}
                onChange={handleEmployeeSelect}
                value={updatedUser?.employee}
                placeholder="Nie wybrano"
                multiple={false}
                showNewPopup={true}
                newItemComponent={
                  AddNewEmployeePopup as React.ComponentType<any>
                }
                newItemProps={{
                  onAddNew: handleAddNewEmployee,
                }}
              />
              </div>
              <ActionButton
                text={"Zapisz Zmiany"}
                src={"src/assets/tick.svg"}
                onClick={handleValidateUpdatedUser}
                className="user-update-button"
              />
            </div>
          ) : (
            <ActionButton
              text={"Zapisz Zmiany"}
              src={"src/assets/tick.svg"}
              onClick={handleValidateUpdatedUser}
              className="user-update-button"
            />
          )}
        </div>

        <ChangePasswordForm />
      </div>
      <div className="all-user-container">
        <h2 className="pw-header all-users">Wszyscy Użytkownicy</h2>
        <div className="all-user-list">
          {users.map((u) => (
            <div className="single-user-container" key={u.id}>
              <div className="single-user-avatar">
                <img src={AVAILABLE_AVATARS[u.avatar]} alt={u.username} />
              </div>
              <div className="single-user-info">
                <span className="single-user-username">{u.username}</span>
                {user?.roles.includes(RoleType.ROLE_ADMIN) && (
                  <div className="single-user-roles">
                    {u.roles.map((role) => (
                      <span className="single-user-role" key={role.id}>
                        {role.name.replace("ROLE_", "")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {u.id != user?.id &&
                user?.roles.includes(RoleType.ROLE_ADMIN) && (
                  <ActionButton
                    src="src/assets/edit.svg"
                    alt="Edytuj Użytkownika"
                    text="Edytuj"
                    onClick={() => {
                      handleForceChangePassword();
                      setSelectedUser(u);
                    }}
                    disableText={true}
                    className="edit-user"
                  />
                )}
            </div>
          ))}
        </div>
      </div>
      <div className="quick-action-buttons">
        <ActionButton
          src="src/assets/logout.svg"
          alt="Wyloguj"
          text="Wyloguj"
          onClick={handleLogout}
          className="logout"
        />
      </div>
      {isAvatarPickerOpen && (
        <AvatarPicker
          currentAvatar={updatedUser?.avatar}
          onSelect={handleAvatarChange}
          className="av-picker-margin"
        />
      )}
      {isForceChangePasswordPopupOpen && (
        <EditUserPopup
          AddNewEmployeePopup={AddNewEmployeePopup}
          handleAddNewEmployee={() => handleAddNewEmployee}
          onClose={() => setIsForceChangePasswordPopupOpen(false)}
          className={"force-change-pw"}
          selectedUser={selectedUser}
          availableRoles={availableRoles}
          refreshUserList={fetchUsers}
          employees={employees}
        />
      )}
    </div>
  );
}
