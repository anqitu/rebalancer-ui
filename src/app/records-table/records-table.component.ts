import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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

  constructor(
    private model: NgbActiveModal,
    private dataService: DataService) {
  }

  ngOnInit(): void {
    this.collectionSize = this.recordData.length;
  }

  get records(): SimulationRecord[] {
    return this.recordData
      .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
  }

  delete(recordId: number): void {
    this.recordData.splice(this.recordData.findIndex(r => r.id === recordId), 1);
    this.dataService.deleteSimulationRecords(recordId);
  }

  close() {
    this.model.close();
  }
}

