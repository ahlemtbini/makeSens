import { AnnotationFormatType } from "../../data/enums/AnnotationFormatType";
import { ImageData, LabelName, LabelPoint } from "../../store/labels/types";
import { ImageRepository } from "../imageRepository/ImageRepository";
import { LabelsSelector } from "../../store/selectors/LabelsSelector";
import { ExporterUtil } from "../../utils/ExporterUtil";
import { findLast } from "lodash";

export class PointLabelsExporter {
  public static async export(exportFormatType: AnnotationFormatType): Promise<void> {
    switch (exportFormatType) {
      case AnnotationFormatType.CSV:
        await PointLabelsExporter.exportAsCSV();
        break;
      default:
        return;
    }
  }

  private static async exportAsCSV(): Promise<void> {
    const content: string = LabelsSelector.getImagesData()
      .map((imageData: ImageData) => {
        return PointLabelsExporter.wrapRectLabelsIntoCSV(imageData);
      })
      .filter((imageLabelData: string) => {
        return !!imageLabelData;
      })
      .join("\n");
    const fileName: string = `${ExporterUtil.getExportFileName()}.csv`;
    //ExporterUtil.saveAs(content, fileName);

    const imagesData = LabelsSelector.getImagesData();
    for (let i = 0; i < imagesData.length; i++) {
      if (!imagesData[i].loadStatus || imagesData[i].labelPoints.length === 0) {
        continue;
      }

      try {
        const annotations = [];

        for (let j = 0; j < imagesData[i].labelPoints.length; j++) {
          const labelName: LabelName = LabelsSelector.getLabelNameById(imagesData[i].labelPoints[j].labelId);
          annotations.push({
            label: labelName.name,
            segmentation: [
              {
                x: imagesData[i].labelPoints[j].point.x,
                y: imagesData[i].labelPoints[j].point.y,
              },
            ],
            type: "Point",
          });
        }

        const image: HTMLImageElement = ImageRepository.getById(imagesData[i].id);
        const requestOptions: RequestInit = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: {
              size: imagesData[i].fileData.size,
              file_url: image.src,
              file_name:imagesData[i].fileData.name,

            },
            annotations,
          }),
        };

        const response = await fetch("http://localhost:4000/Api/V1/", requestOptions);
        const data = await response.json();

        alert("Exported to database");
      } catch (error) {
        alert(`Error occurred while exporting to database. Error message: ${error}`);
      }
    }
  }

  private static wrapRectLabelsIntoCSV(imageData: ImageData): string | null {
    if (imageData.labelPoints.length === 0 || !imageData.loadStatus) return null;

    const image: HTMLImageElement = ImageRepository.getById(imageData.id);
    const labelNames: LabelName[] = LabelsSelector.getLabelNames();
    const labelRectsString: string[] = imageData.labelPoints.map((labelPoint: LabelPoint) => {
      const labelName: LabelName | undefined = findLast(labelNames, { id: labelPoint.labelId });
      const labelFields = !!labelName
        ? [
            labelName.name,
            Math.round(labelPoint.point.x).toString(),
            Math.round(labelPoint.point.y).toString(),
            imageData.fileData.name,
            image.width.toString(),
            image.height.toString(),
          ]
        : [];
      return labelFields.join(",");
    });
    return labelRectsString.join("\n");
  }
}
