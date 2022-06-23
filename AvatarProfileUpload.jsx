import React, { useState } from 'react';
import logger from 'sabio-debug';
import './file.css';
import fileService from '../../services/filesService';
import toastr from 'sabio-debug';
import PropTypes from 'prop-types';
import 'toastr/build/toastr.css';
import { Row, Col } from 'react-bootstrap';
import Dropzone from 'react-dropzone';

const _logger = logger.extend('AvatarProfileUpload');

function AvatarProfileUpload(props) {
    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleAcceptedFiles = (files) => {
        var allFiles = files;
        files.length > 0 &&
            files.map((file) =>
                Object.assign(file, {
                    preview: file['type'].split('/')[0] === 'image' ? URL.createObjectURL(file) : null,
                    formattedSize: formatBytes(file.size),
                })
            );

        allFiles = [...selectedFiles];
        allFiles.push(...files);
        uploadFiles(files);
        setSelectedFiles(allFiles);
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const uploadFiles = (selectedFiles) => {
        for (let i = 0; i < selectedFiles.length; i++) {
            const formData = new FormData();
            formData.append('files', selectedFiles[i]);
            fileService.upload(formData).then(onUploadSuccess).catch(onUploadError);
        }
    };
    const onUploadSuccess = (response) => {
        let responseItems = response.data.items;
        props.onFileChange(responseItems);
        toastr.success('Successfully upload picture');
        _logger('--onUploadSuccess', responseItems);
    };

    const onUploadError = (error) => {
        _logger('--onUploadError', error);
        toastr.error('Failed to upload a picture');
    };

    return (
        <Row>
            <Col sm={2}>
                <div className="rounded-circle border border-2 user-profile-avatar">
                    <Dropzone onDrop={(acceptedFiles) => handleAcceptedFiles(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <div className="dropzone">
                                <div className="dz-message needsclick" {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <i className="h3 text-muted dripicons-cloud-upload"></i>
                                </div>
                            </div>
                        )}
                    </Dropzone>
                </div>
            </Col>
        </Row>
    );
}
AvatarProfileUpload.propTypes = {
    onFileChange: PropTypes.func,
};

export default AvatarProfileUpload;
