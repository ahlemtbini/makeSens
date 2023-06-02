import {ILabelFormatData} from '../interfaces/ILabelFormatData';
import {LabelType} from './enums/LabelType';
import {AnnotationFormatType} from './enums/AnnotationFormatType';

export type ExportFormatDataMap = Record<LabelType, ILabelFormatData[]>;

export const ExportFormatData: ExportFormatDataMap = {
    [LabelType.RECT]: [
        {
            type: AnnotationFormatType.YOLO,
            label: 'Export to DataSet'
        },
        {
            type: AnnotationFormatType.VOC,
            label: 'A .zip package containing files in VOC XML format.'
        },
        {
            type: AnnotationFormatType.CSV,
            label: 'Single CSV file.'
        }
    ],
    [LabelType.POINT]: [
        {
            type: AnnotationFormatType.CSV,
            label: 'Export to DataSet'
        }
    ],
    [LabelType.LINE]: [
        {
            type: AnnotationFormatType.CSV,
            label: 'Export to DataSet'
        }
    ],
    [LabelType.POLYGON]: [
        {
            type: AnnotationFormatType.VGG,
            label: 'Export to DataSet.'
        },
        {
            type: AnnotationFormatType.COCO,
            label: 'Single file in COCO JSON format.'
        }
    ],
    [LabelType.IMAGE_RECOGNITION]: [
        {
            type: AnnotationFormatType.CSV,
            label: 'Single CSV file.'
        },
        {
            type: AnnotationFormatType.JSON,
            label: 'Single JSON file.'
        }
    ]
}
