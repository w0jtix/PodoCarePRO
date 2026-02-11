import { Action } from "../../models/action";
import { useState, useEffect, useCallback } from "react";
import {
  NewClient,
  Client,
  NewClientNote,
  ClientNote,
} from "../../models/client";
import TextInput from "../TextInput";
import ActionButton from "../ActionButton";
import { useUser } from "../User/UserProvider";
import { formatDate } from "../../utils/dateUtils";
import UserService from "../../services/UserService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface ClientFormProps {
  clientDTO: NewClient | Client;
  setClientDTO: React.Dispatch<React.SetStateAction<NewClient | Client>>;
  newClientNotesDTO: NewClientNote[];
  setNewClientNotesDTO: React.Dispatch<React.SetStateAction<NewClientNote[]>>;
  existingClientNotes: ClientNote[];
  setExistingClientNotes: React.Dispatch<React.SetStateAction<ClientNote[]>>;
  setExistingClientNotesIdsToRemove: React.Dispatch<React.SetStateAction<number[]>>;
  action: Action;
  className?: string;
}

export function ClientForm({
  clientDTO,
  setClientDTO,
  action,
  className = "",
  newClientNotesDTO,
  setNewClientNotesDTO,
  existingClientNotes,
  setExistingClientNotes,
  setExistingClientNotesIdsToRemove
}: ClientFormProps) {
  const { user } = useUser();
  const { showAlert } = useAlert();
  const [employeeUsersMap, setEmployeeUsersMap] = useState<Map<number, any>>(
    new Map()
  );

  const fetchUserByEmployeeId = useCallback(
    async (employeeId: number) => {
      if (employeeUsersMap.has(employeeId)) return;

      try {
        const userData = await UserService.getUserByEmployeeId(employeeId);
        setEmployeeUsersMap((prev) => new Map(prev).set(employeeId, userData));
      } catch (error) {
        console.error(
          `Failed to fetch user for employee ${employeeId}:`,
          error
        );
      }
    },
    [employeeUsersMap]
  );

  useEffect(() => {
    existingClientNotes.forEach((note) => {
      if (note.createdBy?.id) {
        fetchUserByEmployeeId(note.createdBy.id);
      }
    });
  }, [existingClientNotes, fetchUserByEmployeeId]);

  const handleFirstNameChange = useCallback((firstName: string) => {
    setClientDTO((prev) => ({
      ...prev,
      firstName: firstName,
    }));
  }, []);

  const handleLastNameChange = useCallback((lastName: string) => {
    setClientDTO((prev) => ({
      ...prev,
      lastName: lastName,
    }));
  }, []);
  const handlePhoneNumberChange = useCallback((phoneNumber: string) => {
    setClientDTO((prev) => ({
      ...prev,
      phoneNumber: phoneNumber === "" ? null : phoneNumber,
    }));
  }, []);

  const handleSignedRegulations = useCallback(() => {
    setClientDTO((prev) => ({
      ...prev,
      signedRegulations: !prev.signedRegulations,
    }));
  }, []);

  const handleBoostClient = useCallback(() => {
    setClientDTO((prev) => ({
      ...prev,
      boostClient: !prev.boostClient,
    }));
  }, []);
  const handleRedFlag = useCallback(() => {
    setClientDTO((prev) => ({
      ...prev,
      redFlag: !prev.redFlag,
    }));
  }, []);

  const addNote = useCallback(() => {
    const newNote: NewClientNote = {
      client: clientDTO as Client,
      content: "",
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: user?.employee ?? null,
    };

    setNewClientNotesDTO((prev) => [...prev, newNote]);
  }, [user, setNewClientNotesDTO, clientDTO]);

  const handleNewNoteContentUpdate = useCallback(
    (content: string, index: number) => {
      setNewClientNotesDTO((prev) =>
        prev.map((note, i) =>
          i === index ? { ...note, content: content } : note
        )
      );
    },
    [setNewClientNotesDTO]
  );

  const handleExistingNotRemove = useCallback((noteId: number) => {
    return () => {
      setExistingClientNotesIdsToRemove((prev) => [...prev, noteId]);
      setExistingClientNotes((prev) =>
        prev.filter((note) => note.id !== noteId)
      );
    };
  }, [setExistingClientNotesIdsToRemove, setExistingClientNotes]);

  return (
    <div
      className={`custom-form-container flex-column width-max g-05 ${action
        .toString()
        .toLowerCase()} ${className}`}
    >
      <section className={`form-row flex width-max align-items-center ${action === Action.CREATE ? "space-between" : "space-around"} mb-05`}>   
        <ActionButton
            src={"src/assets/redflag.svg"}
            alt={"Red Flag"}
            text={`Red Flag`}
            iconTitle={"Klient kontrowersyjny"}
            onClick={handleRedFlag}
            className={`${clientDTO.redFlag ? "active-r" : ""}`}
          />     
        
      {action === Action.CREATE && (
          <ActionButton
            src={"src/assets/boost.svg"}
            alt={"Boost"}
            text={`Klient z Boosta`}
            iconTitle={"Klient pozyskany przez Boost"}
            onClick={handleBoostClient}
            className={`${clientDTO.boostClient ? "active-p" : ""}`}
          />
      )}       
        
          <ActionButton
            src={"src/assets/terms.svg"}
            alt={"Regulamin"}
            text={`Regulamin ${clientDTO.signedRegulations ? " podpisany" : " niepodpisany"}`}
            iconTitle={"Klient podpisał regulamin"}
            onClick={handleSignedRegulations}
            className={`client-terms ${clientDTO.signedRegulations ? "active-g" : "active-r"}`}
          />
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Imię:</span>
        <TextInput
          dropdown={false}
          value={clientDTO.firstName}
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleFirstNameChange(inputName);
            }
          }}
          className="name"
        />
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Nazwisko:</span>
        <TextInput
          dropdown={false}
          value={clientDTO.lastName}
          onSelect={(inputName) => {
            if (typeof inputName === "string") {
              handleLastNameChange(inputName);
            }
          }}
          className="name"
        />
      </section>
      <section className="form-row flex width-max align-items-center space-between">
        <span className="input-label">Nr kontaktowy:</span>
        <TextInput
          dropdown={false}
          value={clientDTO.phoneNumber ?? ""}
          onSelect={(number) => {
            if (typeof number === "string") {
              handlePhoneNumberChange(number);
            }
          }}
          numbersOnly={true}
          className=""
        />
      </section>
      
      {action === Action.EDIT && (
        <>
        <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Dodaj notatkę"}
            text={"Dodaj notatkę"}
            onClick={addNote}
          />
        <section className="client-notes-section flex-column width-max height-fit-content align-items-start">
          
          {newClientNotesDTO.length > 0 && (
            <div className="client-notes-list flex-column align-items-center width-max g-05 mt-05 mb-05">
              {newClientNotesDTO.map((note, index) => (
                <div
                  key={index}
                  className="note-item width-max align-items-center flex-column"
                >
                  <div className="note-header flex new width-max justify-center">
                    <div className="note-header-content mb-025 mt-025 ml-1 mr-05 width-max align-items-center flex g-05">
                      <div className="flex width-max align-items-center space-between">
                      <div className="flex align-items-center g-05 justify-center">
                        <img
                          src={`src/assets/avatars/${user?.avatar}`}
                          alt="Avatar"
                          className="user-pfp small"
                        ></img>
                        <span className="qv-span">{user?.employee!.name}</span>
                      </div>
                      <span className="qv-span">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <button className="popup-close-button transparent border-none flex align-items-center justify-center pointer"
                    onClick={ () =>
                      setNewClientNotesDTO((prev) => (
                        prev.filter((_,i) => i !== index)
                        ))}>
                        <img
                          src="src/assets/close.svg"
                          alt="close"
                          className="popup-close-icon note"
                        />
                      </button>
                    </div>
                  </div>
                  <div className="note-content height-fit-content mt-05 mb-05 width-90">
                    <TextInput
                      value={note.content ?? ""}
                      rows={2}
                      multiline={true}
                      placeholder={"Wpisz Notatkę o Kliencie..."}
                      onSelect={(note) => {
                        if (typeof note === "string") {
                          handleNewNoteContentUpdate(note, index);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {existingClientNotes.length > 0 && (
            <div className="client-notes-list flex-column align-items-center width-max g-05 mt-05 mb-05">
              {existingClientNotes.map((note, index) => {
                const noteUser = employeeUsersMap.get(note.createdBy.id);
                return (
                  <div
                    key={note.id}
                    className="note-item width-max align-items-center flex-column"
                  >
                    <div className="note-header flex width-max justify-center">
                      <div className="note-header-content mb-025 mt-025 ml-1 mr-05 width-max align-items-center flex g-05">
                        <div className="flex width-max align-items-center space-between">

                        <div className="flex align-items-center g-05 justify-center">
                          <img
                            src={`src/assets/avatars/${noteUser?.avatar}`}
                            alt="Avatar"
                            className="user-pfp small"
                          />
                          <span className="qv-span">{note.createdBy.name}</span>
                        </div>
                        <span className="qv-span">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <button className="popup-close-button transparent border-none flex align-items-center justify-center pointer"
                      onClick={handleExistingNotRemove(note.id)}
                      >
                        <img
                          src="src/assets/close.svg"
                          alt="close"
                          className="popup-close-icon note"
                        />
                      </button>
                      </div>
                      
                    </div>
                    <div className="note-content height-fit-content mt-1 mb-1 width-90">
                      <span className="qv-span italic">{note.content}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        </>
      )}
    </div>
  );
}

export default ClientForm;
