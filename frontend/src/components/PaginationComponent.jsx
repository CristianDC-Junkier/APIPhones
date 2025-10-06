import React from 'react';
import { Button } from 'reactstrap';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // importamos los íconos

const getPaginationNumbers = (page, totalPages) => {
    const pages = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        if (page <= 2) {
            pages.push(1, 2, 3, 'next', totalPages);
        } else if (page >= totalPages - 1) {
            pages.push(1, 'prev', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, 'prev', page - 1, page, page + 1, 'next', totalPages);
        }
    }

    return pages;
};

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = getPaginationNumbers(currentPage, totalPages);

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="pagination-controls d-flex justify-content-center mb-2 mt-0 flex-wrap gap-2">
            {pageNumbers.map((item, index) => {
                if (item === 'prev') {
                    return (
                        <Button key={index} color="secondary" style={{ padding: "0.35rem 0.5rem",  }}  onClick={handlePrev}>
                            <FaChevronLeft size={14} />
                        </Button>
                    );
                }
                if (item === 'next') {
                    return (
                        <Button key={index} color="secondary" style={{ padding: "0.35rem 0.5rem" }}  onClick={handleNext}>
                            <FaChevronRight size={14} />
                        </Button>
                    );
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
