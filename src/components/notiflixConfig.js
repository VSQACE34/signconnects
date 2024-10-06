import Notiflix from 'notiflix';

// Just so that when user click on the overlay would close the message too
export const initializeNotiflix = () => {
    Notiflix.Report.init({
        backOverlayClickToClose: true,
    });
};

export const showSuccessReport = (title, message, callback) => {
    initializeNotiflix();
    Notiflix.Report.success(title, message, 'Okay', callback);
};

// export const showFailureReport = (title, message, callback) => {
//     initializeNotiflix();
//     Notiflix.Report.failure(title, message, 'Okay', callback);
// };