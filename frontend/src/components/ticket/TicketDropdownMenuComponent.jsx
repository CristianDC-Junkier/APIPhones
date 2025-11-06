import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function TicketDropdownMenuComponent({ selectedIds = [], onMarkTicket, disabled = false }) {
    const handleMenu = async (action) => {
        onMarkTicket(selectedIds, action);
    };

    if (disabled) return null;

    return (
        <UncontrolledDropdown direction="start" container="body">
            <DropdownToggle
                color="none"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                title="Acciones sobre tickets"
            >
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem onClick={(e) => { e.stopPropagation(); handleMenu("OPEN"); }}>
                    Marcar como <strong>No leído</strong>
                </DropdownItem>
                <DropdownItem onClick={(e) => { e.stopPropagation(); handleMenu("RESOLVED"); }}>
                    Marcar como <strong>Resuelto</strong>
                </DropdownItem>
            </DropdownMenu>
        </UncontrolledDropdown>
    );
}
