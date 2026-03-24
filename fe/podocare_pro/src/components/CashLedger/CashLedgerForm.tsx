import React from 'react'
import TextInput from '../TextInput';
import { CashLedger } from '../../models/cash_ledger'
import { formatDate } from '../../utils/dateUtils';
import { Action } from '../../models/action';
import ActionButton from '../ActionButton';
import { useState } from 'react';
import CostInput from '../CostInput';
import editIcon from '../../assets/edit.svg';

export interface CashLedgerFormProps {
    cashLedger: CashLedger;
    setCashLedger?: React.Dispatch<
        React.SetStateAction<CashLedger | null>
      >;
    action?: Action;
}

const CashLedgerForm = ({ cashLedger, setCashLedger, action = Action.DISPLAY }: CashLedgerFormProps) => {
    const [formUI, setFormUI] = useState({
        showOpeningAmountInput: false,
        showDepositInput: false,
        showCashOutAmountInput: false,
        showClosingAmountInput: false,
        showNoteInput: false
    })

  return (
    <div className="width-max flex-column align-items-center g-075">
                <div className="width-max flex space-between">
                    <span className="span-cl popup">Data Kasetki:</span>
                    
                    <span className="span-cl popup">{formatDate(cashLedger.date)}</span>
                    
                </div>
                <div className="width-max flex-column g-05">
                    <div className="width-max flex space-between">
                    <span className="span-cl popup">Stan początkowy:</span>
                    <div className="flex g-10px align-items-center">
                    <span className="span-cl popup val">{(cashLedger.openingAmount + cashLedger.deposit).toFixed(2)} zł</span>
                    {action === Action.EDIT && (
                        <ActionButton
                                      src={editIcon}
                                      alt="Edytuj St. Początkowy"
                                      iconTitle={"Edytuj St. Początkowy"}
                                      text="Edytuj"
                                      onClick={() => setFormUI((prev) => ({
                                        ...prev,
                                        showOpeningAmountInput: !prev.showOpeningAmountInput
                                      }))}
                                      disableText={true}
                                      className="clear cl-history"
                                    />
                    )}
                    </div>
                    </div>
                    {formUI.showOpeningAmountInput && (
                        <div className="width-max flex justify-end">
                        <CostInput
                            selectedCost={cashLedger.openingAmount}
                            onChange={(v) => setCashLedger?.((prev) => ({ ...prev!, openingAmount: v }))}
                            className="cash-ledger"
                        />
                        </div>
                    )}
                </div>
                <div className="width-max flex-column g-05">
                    <div className="width-max flex space-between">
                    <span className="span-cl popup">W tym depozyt:</span>
                    <div className="flex g-10px align-items-center">
                    <span className={`span-cl popup ${cashLedger.deposit !=0 ? "val" : ""}`}>{cashLedger.deposit.toFixed(2)} zł</span>
                    {action === Action.EDIT && (
                        <ActionButton
                                      src={editIcon}
                                      alt="Edytuj Depozyt"
                                      iconTitle={"Edytuj Depozyt"}
                                      text="Edytuj"
                                      onClick={() => setFormUI((prev) => ({
                                        ...prev,
                                        showDepositInput: !prev.showDepositInput
                                      }))}
                                      disableText={true}
                                      className="clear cl-history"
                                    />
                    )}
                    </div>
                    </div>
                    {formUI.showDepositInput && (
                        <div className="width-max flex justify-end">
                            <CostInput
                                selectedCost={cashLedger.deposit}
                                onChange={(v) => setCashLedger?.((prev) => ({ ...prev!, deposit: v }))}
                                className="cash-ledger"
                            />
                        </div>
                    )}
                </div>
                <div className="width-max flex-column g-05">
                    <div className="width-max flex space-between">
                    <span className="span-cl popup">Wypłacono:</span>
                    <div className="flex g-10px align-items-center">
                    <span className={`span-cl popup ${cashLedger.cashOutAmount !=0 ? "cashout-amt" : ""}`}>{cashLedger.cashOutAmount.toFixed(2)} zł</span>
                    {action === Action.EDIT && (
                        <ActionButton
                                      src={editIcon}
                                      alt="Edytuj Wypłatę"
                                      iconTitle={"Edytuj Wypłatę"}
                                      text="Edytuj"
                                      onClick={() => setFormUI((prev) => ({
                                        ...prev,
                                        showCashOutAmountInput: !prev.showCashOutAmountInput
                                      }))}
                                      disableText={true}
                                      className="clear cl-history"
                                    />
                    )}
                    </div>
                    </div>
                    {formUI.showCashOutAmountInput && (
                        <div className="width-max flex justify-end">
                            <CostInput
                                selectedCost={cashLedger.cashOutAmount}
                                onChange={(v) => setCashLedger?.((prev) => ({ ...prev!, cashOutAmount: v }))}
                                className="cash-ledger"
                            />
                        </div>
                    )}
                </div>
                <div className="width-max flex-column g-05">
                    <div className="width-max flex space-between">
                    <span className="span-cl popup">Saldo końcowe:</span>
                    <div className="flex g-10px align-items-center">
                    <span className="span-cl popup closing-amt">{cashLedger.closingAmount!.toFixed(2)} zł</span>
                    {action === Action.EDIT && (
                        <ActionButton
                                      src={editIcon}
                                      alt="Edytuj Saldo Końcowe"
                                      iconTitle={"Edytuj Saldo Końcowe"}
                                      text="Edytuj"
                                      onClick={() => setFormUI((prev) => ({
                                        ...prev,
                                        showClosingAmountInput: !prev.showClosingAmountInput
                                      }))}
                                      disableText={true}
                                      className="clear cl-history"
                                    />
                    )}
                    </div>
                    </div>
                    {formUI.showClosingAmountInput && (
                        <div className="width-max flex justify-end">
                            <CostInput
                                selectedCost={cashLedger.closingAmount ?? 0}
                                onChange={(v) => setCashLedger?.((prev) => ({ ...prev!, closingAmount: v }))}
                                className="cash-ledger"
                            />
                        </div>
                    )}
                </div>
                {(cashLedger.note && cashLedger.note.trim() != "" || action === Action.EDIT) && (
                    <div className="width-max flex-column g-025">
                        <div className="flex g-10px align-items-center">
                            <span className="span-cl popup">Notatka:</span>
                            {action === Action.EDIT && (
                                <ActionButton
                                    src={editIcon}
                                    alt="Edytuj Notatkę"
                                    iconTitle={"Edytuj Notatkę"}
                                    text="Edytuj"
                                    onClick={() => setFormUI((prev) => ({
                                        ...prev,
                                        showNoteInput: !prev.showNoteInput
                                    }))}
                                    disableText={true}
                                    className="clear cl-history"
                                />
                            )}
                        </div>
                        {formUI.showNoteInput ? (
                            <TextInput
                                placeholder="Notatka..."
                                multiline={true}
                                rows={2}
                                value={cashLedger.note ?? ""}
                                onSelect={(v) => setCashLedger?.((prev) => ({ ...prev!, note: v as string }))}
                            />
                        ) : (
                            cashLedger.note && cashLedger.note.trim() !== "" && (
                                <span className="span-cl popup note italic text-align-start">{cashLedger.note}</span>
                            )
                        )}
                    </div>
                )}
              </div>
  )
}

export default CashLedgerForm;
