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
import { Employee } from "../../models/employee";
import UserPopup from "../Popups/UserPopup";

export function ProfileDashboard() {
  const { user, setUser, refreshUser } = useUser();
  const { showAlert } = useAlert();

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editUserId, setEditUserId] = useState<number | string | null>(null);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const [isCreateUserPopupOpen, setIsCreateUserPopupOpen] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const response = await UserService.getAllUsers();
      setUsers(response);
    } catch (err) {
      showAlert("Błąd", AlertType.ERROR);
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
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching employees:", error);
      });
  };
  const fetchRoles = async () => {
    try {
      const response = await RoleService.getAllRoles();
      setAvailableRoles(response);
    } catch (err) {
      showAlert("Błąd", AlertType.ERROR);
      console.error("Błąd podczas pobierania roli!", err);
    }
  };

  const fetchCurrentUser = async () => {
    const jwtUser = AuthService.getCurrentUser() as JwtUser;
    if (!jwtUser?.id) return;

    try {
      const userData = await UserService.getUserById(jwtUser.id);
      setUpdatedUser(userData);
    } catch (error) {
      console.error("Error fetching current user:", error);
      showAlert("Błąd pobierania danych użytkownika!", AlertType.ERROR);
    }
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
  const handleLogout = () => {
    AuthService.logout();
  };

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
    console.log(updatedUser)
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
    refreshUser();
    fetchCurrentUser();

    if(user?.roles.includes(RoleType.ROLE_ADMIN)) {
      fetchUsers();
      fetchRoles();
      fetchEmployees();
    }
  }, []);

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <div className={`user-container flex align-items-center space-between width-85 mt-1`}>
        <div className={`user-basic-info relative flex-column`}>
          <div className="profile-container flex align-items-center space-between">
            <div className="width-max space-around flex align-items-center g-1">

              <div className="flex-column align-items-center g-1">
              <h2 className="h2-username text-align-center">{user?.username}</h2>
              <div className="profile-avatar flex align-items-center justify-center mb-1">
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="profile-avatar-image width-max height-max"
                />
              </div>
              </div>

              {user?.roles.includes(RoleType.ROLE_ADMIN) && (
              <div className="employee-dropdown-container flex-column align-items-center g-1 align-self-start mt-05">
              <h2 className="pw-header text-align-center m-0">Pracownik:</h2>
              <DropdownSelect
                items={employees}
                onChange={handleEmployeeSelect}
                value={updatedUser?.employee}
                placeholder="Nie wybrano"
                multiple={false}
                showNewPopup={true}
                allowNew={false}
              />
              </div>
              )}
            </div>
            
            
          </div>
            <div className="user-details-bottom-section height-85 align-self-center flex g-1 align-items-center width-max space-around">             
              <ActionButton
                text={"Wybierz Avatar"}
                disableImg={true}
                onClick={toggleAvatarPicker}
                className="avatar-button"
              />
              <ActionButton
                text={"Zapisz Zmiany"}
                src={"src/assets/tick.svg"}
                onClick={handleValidateUpdatedUser}
                className="user-update-button"
              />
            </div>
        </div>

        <ChangePasswordForm />
      </div>
      {user?.roles.includes(RoleType.ROLE_ADMIN) && (
      <div className="all-user-container mt-5 width-85 g-1 height-fit-content justify-center">
        <div className="width-95 flex align-items-center justify-center">
          {user?.roles.includes(RoleType.ROLE_ADMIN) ? (
            <>
            <div className="f-1"></div>
          <h2 className="pw-header text-align-center all-users">Wszyscy Użytkownicy</h2>
          <div className="f-1 flex justify-end">
            <ActionButton
              text={"Nowy Użytkownik"}
              src={"src/assets/addNew.svg"}
              alt="Nowy Użytkownik"
              onClick={() => setIsCreateUserPopupOpen(true)}
            />
          </div>
          </>
          ) : (
            <h2 className="pw-header text-align-center all-users">Wszyscy Użytkownicy</h2>
          )}
          
        </div>
        
        <div className="all-user-list width-max flex-column g-05 mb-1">
          {users.map((u) => (
            <div className="single-user-container flex width-90 align-self-center g-2" key={u.id}>
              <div className="single-user-avatar flex align-items-center ml-1">
                <img src={AVAILABLE_AVATARS[u.avatar]} alt={u.username} />
              </div>
              <div className="single-user-info flex g-2 align-items-center">
                <span className="single-user-username">{u.username}</span>
                {user?.roles.includes(RoleType.ROLE_ADMIN) && (
                  <div className="single-user-roles flex g-2">
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
                    iconTitle={"Edytuj Użytkownika"}
                    text="Edytuj"
                    onClick={() => 
                      setEditUserId(u.id)
                    }
                    disableText={true}
                    className="edit-user"
                  />
                )}
            </div>
          ))}
        </div>
          



      </div>
      )}
      <div className="quick-action-buttons flex width-85 mt-2 justify-end">
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
      {editUserId != null && (
        <EditUserPopup
          onClose={() => setEditUserId(null)}
          className={"force-change-pw"}
          userId={editUserId}
          availableRoles={availableRoles}
          refreshUserList={fetchUsers}
          employees={employees}
        />
      )}
      {isCreateUserPopupOpen && (
        <UserPopup
          onClose={() => {
            setIsCreateUserPopupOpen(false);
            fetchUsers();
          }
          }
        />
      )}
    </div>
  );
}
export default ProfileDashboard;