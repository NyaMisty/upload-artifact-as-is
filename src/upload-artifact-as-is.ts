import * as core from '@actions/core'
import {DefaultArtifactClient, UploadArtifactOptions} from '@actions/artifact'
import { basename, dirname } from 'path'
import { Inputs } from './constants'
import { findFilesToUpload } from './search'

async function run(): Promise<void> {
    try {
        const path = core.getInput(Inputs.Path, { required: true })

        const searchResult = await findFilesToUpload(path)
        if (searchResult.filesToUpload.length === 0) {
            core.warning(
                `No files were found for the provided path: ${path}. No artifacts will be uploaded.`
            )
        } else {
            core.info(
                `With the provided path, there will be ${searchResult.filesToUpload.length} files uploaded`
            )
            core.debug(`Root artifact directory is ${searchResult.rootDirectory}`)

            const artifactClient = new DefaultArtifactClient()
            const options: UploadArtifactOptions = {
                // continueOnError: true // no longer there
            }
            for (const file of searchResult.filesToUpload) {
                core.debug(`Uploading ${file} as ${basename(file)}`)
                await artifactClient.uploadArtifact(
                    basename(file),
                    [file],
                    dirname(file),
                    options
                )
            }

            core.info('Artifact upload has finished successfully!')
        }
    } catch (err) {
        core.setFailed((err as Error).message)
    }
}

run()
