import React from 'react';
import { Button } from 'reactstrap';

const getPaginationNumbers = (page, totalPages) => {
    const pages = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (page <= 2) {
            pages.push(1, 2, 3, '...', totalPages);
        } else if (page >= totalPages - 1) {
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
        }
    }

    return pages;
};

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = getPaginationNumbers(currentPage, totalPages);

    return (
        <div className="pagination-controls d-flex justify-content-center mt-0 flex-wrap gap-2">
            {pageNumbers.map((item, index) => {
                if (item === '...') {
                    return <span key={index} className="pagina-text px-2">...</span>;
                }

                return (
                    <Button
                        key={index}
                        color={item === currentPage ? 'primary' : 'secondary'}
                        className="pagination-btn"
                        onClick={() => onPageChange(item)}
                    >
                        {item}
                    </Button>
                );
            })}
        </div>
    );
};

export default PaginationComponent;
