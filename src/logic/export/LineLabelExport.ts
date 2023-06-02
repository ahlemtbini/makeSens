import { AnnotationFormatType } from "../../data/enums/AnnotationFormatType";
import { LabelsSelector } from "../../store/selectors/LabelsSelector";
import { ImageData, LabelLine, LabelName } from "../../store/labels/types";
import { ExporterUtil } from "../../utils/ExporterUtil";
import { ImageRepository } from "../imageRepository/ImageRepository";
import { findLast } from "lodash";

export class LineLabelsExporter {
  public static export(exportFormatType: AnnotationFormatType): void {
    switch (exportFormatType) {
      case AnnotationFormatType.CSV:
        LineLabelsExporter.exportAsCSV();
        break;
      default:
        return;
    }
  }

  private static async exportAsCSV(): Promise<void> {
    const imagesData = LabelsSelector.getImagesData();
    for (let i = 0; i < imagesData.length; i++) {
      if (!imagesData[i].loadStatus || imagesData[i].labelLines.length === 0) {
        continue;
      }

      const content: string = LineLabelsExporter.wrapLineLabelsIntoCSV(imagesData[i]);
      if (!content) {
        continue;
      }

      const fileName: string = `${ExporterUtil.getExportFileName()}.csv`;
      //ExporterUtil.saveAs(content, fileName);

      try {
        // Store Database for polygon
        const annotations = [];

        for (let j = 0; j < imagesData[i].labelLines.length; j++) {
          const labelName: LabelName = LabelsSelector.getLabelNameById(imagesData[i].labelLines[j].labelId);
          annotations.push({
            label: labelName.name,
            segmentation: [
              { x: imagesData[i].labelLines[j].line.start.x, Y: imagesData[i].labelLines[j].line.start.y },
              { x: imagesData[i].labelLines[j].line.end.x, Y: imagesData[i].labelLines[j].line.end.y }
            ],
            type: "line"
          });
        }

        const image: HTMLImageElement = ImageRepository.getById(imagesData[i].id);
        const requestOptions: RequestInit = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: {
              size: imagesData[i].fileData.size,
              file_url: image.src,
              file_name:imagesData[i].fileData.name,
            },
            annotations
          })
        };

        const response = await fetch('http://localhost:4000/Api/V1/', requestOptions);
        const data = await response.json();

        alert('Exported to database');
      } catch (error) {
        alert(`Error occurred while exporting to database. Error message: ${error}`);
      }
    }
  }

  private static wrapLineLabelsIntoCSV(imageData: ImageData): string {
    const image: HTMLImageElement = ImageRepository.getById(imageData.id);
    const labelNames: LabelName[] = LabelsSelector.getLabelNames();
    const labelLinesString: string[] = imageData.labelLines.map((labelLine: LabelLine) => {
      const labelName: LabelName = findLast(labelNames, { id: labelLine.labelId });
      if (!labelName) {
        return null;
      }

      const labelFields = [
        labelName.name,
        Math.round(labelLine.line.start.x).toString(),
        Math.round(labelLine.line.start.y).toString(),
        Math.round(labelLine.line.end.x).toString(),
        Math.round(labelLine.line.end.y).toString(),
        imageData.fileData.name,
        image.width.toString(),
        image.height.toString()
      ];
      return labelFields.join(",");
    }).filter(l => l !== null);

    return labelLinesString.length === 0 ? null : labelLinesString.join("\n");
  }
}
