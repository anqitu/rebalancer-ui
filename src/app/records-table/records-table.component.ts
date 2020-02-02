import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SimulationRecordResponse } from 'src/models/simulation-record-response';
import { faDownload, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { SimulationRecord } from 'src/models/simulation-record';
import { environment } from 'src/environments/environment';
import { DataService } from '../data.service';

@Component({
  selector: 'rbc-records-table',
  templateUrl: './records-table.component.html',
  styleUrls: ['./records-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordsTableComponent implements OnInit {

  page = 1;
  pageSize = 6;
  collectionSize = 0;
  pageSizeOptions = [2, 4, 6, 8];
  recordData: SimulationRecord[] = [];
  headers: string[];
  downloadIcon = faDownload;
  deleteIcon = faTrashAlt;

  exportUrl = `${environment.serverEndpoint}/download`;
  deleteUrl = `${environment.serverEndpoint}/delete`;

  @Input() public simulationRecordResponse: SimulationRecordResponse;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  constructor(
    private model: NgbActiveModal,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    this.recordData = this.simulationRecordResponse.data;
    this.headers = this.simulationRecordResponse.headers;
    this.collectionSize = this.recordData.length;
  }

  get records(): SimulationRecord[] {
    return this.recordData
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  delete(recordId): void {
    this.dataService.deleteSimulationRecords(recordId).then( res =>
      this.passEntry.emit(res));
  }

  close() {
    this.model.close();
  }
}

