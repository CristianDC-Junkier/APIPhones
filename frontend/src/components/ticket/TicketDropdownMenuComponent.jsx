import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

import { markTicket } from "../../services/TicketService";

export default function TicketDropdownMenuComponent({ ticketId, updateTickets }) {
    const handleMenu = async (action) => {
        if (action === "NotRead") {
            const response = await markTicket({ id: ticketId, read: false, warned: false, resolved: false });
            if (response.success) {
                updateTickets();
            }
        } else if (action === "Resolved") {
            const response = await markTicket({ id: ticketId, read: false, warned: false, resolved: true });
            if (response.success) {
                updateTickets();
            }
        }
    }

    return (
        <UncontrolledDropdown direction="start">
            <DropdownToggle color="none" size="sm" onClick={(e) => e.stopPropagation() }>
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem onClick={(e) => { e.stopPropagation(); handleMenu("NotRead"); }}>
                    Marcar como <strong>No Leído</strong>
                </DropdownItem>
                <DropdownItem onClick={(e) => { e.stopPropagation(); handleMenu("Resolved"); }}>
                    Marcar como <strong>Resuelto</strong>
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );

}