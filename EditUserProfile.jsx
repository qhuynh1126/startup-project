import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import PropTypes from 'prop-types';
import debug from 'sabio-debug';
import * as usersService from '../../services/usersService';
import { editUserSchema } from './formSchema';
import 'toastr/build/toastr.css';
import toastr from 'toastr';
import { Card, Button, Col, Container, Row } from 'react-bootstrap';
import './userauth.css';
import PageTitle from '../../pages/candidates/PageTitle';
import FileUpload from '../file/FileUpload';
import * as surveyService from '../../services/surveysService';
import UpdatePassword from './UpdatePassword';
import SurveyCard from './SurveyCard';
import PaginationComponent from './Pagination';
import SurveySelect from './SurveySelect';
import AvatarProfileUpload from '../file/AvatarProfileUpload';

function EditUserProfile(props) {
    const _logger = debug.extend('editUserProfile');
    const [userData, setUser] = useState({
        firstName: '',
        lastName: '',
        avatarUrl: '',
    });
    const [showForm, setShowForm] = useState(true);
    const [showSurvey, setShowSurvey] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [surveyData, setSurveyData] = useState({
        arrayOfSurveys: [],
        surveyComponents: [],
    });

    _logger(props);

    const currentUser = props.currentUser.id;
    const [currentPage, setCurrentPage] = useState(1);
    const [surveysPerPage, setSurveysPerPage] = useState(5);
    const totalCount = surveyData.surveyComponents.length;

    const lastSurveyNumber = currentPage * surveysPerPage;
    const firstSurveyIndex = lastSurveyNumber - surveysPerPage;
    const limitedSurveys = surveyData.surveyComponents.slice(firstSurveyIndex, lastSurveyNumber);

    const onToggleForm = () => {
        setShowForm(() => true);
        setShowPass(() => false);
        setShowSurvey(() => false);
    };

    const onToggleSurveys = () => {
        setShowSurvey(() => true);
        setShowPass(() => false);
        setShowForm(() => false);
    };

    const onTogglePassForm = () => {
        setShowPass(() => true);
        setShowForm(() => false);
        setShowSurvey(() => false);
    };

    useEffect(() => {
        usersService.getUserProfile(currentUser).then(onGetUserSuccess).catch(onSubmitError);
    }, []);

    const onGetUserSuccess = (response) => {
        _logger('onGetUserSuccess', response);
        const userProfile = response.data.item;
        setUser((prevState) => ({ ...prevState, ...userProfile }));
    };

    const onSubmitSuccess = () => toastr.success('User update successful');
    const onSubmitError = (response) => toastr.error(response);
    const submitForm = (values) => {
        setUser((prevState) => ({ ...prevState, ...values }));
        usersService.updateUser(currentUser, values).then(onSubmitSuccess).catch(onSubmitError);
    };

    const onFileUpload = (files, setFieldValue) => {
        const aUrl = files[0].url;
        setFieldValue('avatarUrl', aUrl);
    };

    useEffect(() => {
        surveyService.getSurveysByCurrent(0, 100).then(onGetSurveysSuccess).catch(onGetSurveysError);
    }, []);

    const onGetSurveysSuccess = (response) => {
        _logger('Response', response);
        let surveyArray = response.data.item.pagedItems;

        setSurveyData((prevState) => {
            const pd = { ...prevState };
            pd.arrayOfSurveys = surveyArray;
            pd.surveyComponents = surveyArray.map(mapSurvey);
            return pd;
        });
    };

    const onGetSurveysError = (error) => {
        _logger(error);
    };

    const mapSurvey = (aSurvey) => {
        return <SurveyCard survey={aSurvey} key={'a1-' + aSurvey.id} />;
    };

    const editUserForm = (
        <Container
            className="container-fluid"
            style={{
                paddingTop: '200px',
                paddingBottom: '200px',
            }}>
            <Row>
                <Col sm={10}>
                    <h4 className="mt-0">{`Hello ${userData.firstName}`}</h4>
                    <p className="text-muted mb-4">{'Please click Submit Changes below to save changes.'}</p>
                </Col>
                <Col sm={2}>
                    <img
                        src={userData.avatarUrl}
                        alt="User Profile Avatar"
                        className="rounded-circle border border-2 user-profile-avatar"
                    />
                </Col>
            </Row>
            <Formik
                enableReinitialize={true}
                initialValues={{
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    avatarUrl: userData.avatarUrl,
                }}
                validationSchema={editUserSchema}
                onSubmit={submitForm}>
                {({ setFieldValue }) => (
                    <Form>
                        <div className="form-group  justify-content-center ">
                            <div className="my-2">
                                <label htmlFor="firstName" className="col-form-label ">
                                    First Name
                                </label>
                                <Field type="text" className="form-control" id="firstName" name="firstName" />
                                <ErrorMessage name={'firstName'} component="div" className="error my-1 mx-1" />
                            </div>
                        </div>
                        <div className="form-group  justify-content-center">
                            <div className=" my-2">
                                <label htmlFor="lastName" className="col-form-label">
                                    Last Name
                                </label>
                                <Field type="text" className="form-control" id="lastName" name="lastName" />
                                <ErrorMessage name={'lastName'} component="div" className="error my-1 mx-1" />
                            </div>
                        </div>
                        <div className="form-group  justify-content-center ">
                            <FileUpload onFileChange={(response) => onFileUpload(response, setFieldValue)} />
                        </div>
                        <div className="form-group  justify-content-center ">
                            <AvatarProfileUpload onFileChange={(response) => onFileUpload(response, setFieldValue)} />
                        </div>
                        <div style={{ display: 'flex' }}>
                            <Button variant="primary" type="submit" style={{ marginLeft: 'auto' }}>
                                <i className="mdi mdi-account-circle"></i> {'Submit Changes'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Container>
    );
    return (
        <React.Fragment>
            <Container fluid="sm">
                <PageTitle
                    breadCrumbItems={[{ label: 'Edit Profile', path: '/profile/edit', active: true }]}
                    title={'Edit Profile'}
                />
                <Row>
                    <Col sm={2} className="justify-content-left">
                        <Row>
                            <Button variant="btn-primary" onClick={onToggleForm}>
                                Edit Profile
                            </Button>
                        </Row>
                        <Row>
                            <Button variant="btn-primary" onClick={onTogglePassForm}>
                                Change Password
                            </Button>{' '}
                        </Row>
                        <Row>
                            <Button variant="btn-primary" onClick={onToggleSurveys}>
                                {userData.firstName}`s Surveys
                            </Button>
                        </Row>
                    </Col>
                    <Col>
                        <Card>
                            <Card.Body>
                                {showSurvey && (
                                    <Container fluid="sm">
                                        <Card.Header>
                                            <h4>{userData.firstName}`s Surveys</h4>
                                        </Card.Header>
                                        <Row>{limitedSurveys}</Row>
                                        <Row>
                                            <Col md="auto">
                                                <SurveySelect
                                                    itemsPerPage={surveysPerPage}
                                                    setItemsPerPage={setSurveysPerPage}
                                                />
                                            </Col>
                                            <Col md="auto">
                                                <PaginationComponent
                                                    total={totalCount}
                                                    itemsPerPage={surveysPerPage}
                                                    currentPage={currentPage}
                                                    setCurrentPage={setCurrentPage}
                                                    alwaysShown={false}
                                                />
                                            </Col>
                                        </Row>
                                    </Container>
                                )}
                                {showForm && editUserForm}
                                {showPass && <UpdatePassword current={currentUser} />}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </React.Fragment>
    );
}

EditUserProfile.propTypes = {
    currentUser: PropTypes.shape({
        id: PropTypes.number,
        roles: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string])),
        email: PropTypes.string,
        isLoggedIn: PropTypes.bool,
    }),
};

export default EditUserProfile;
