import { Component, OnInit, Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SimulationRecordItem } from 'src/models/simulation-record-item';
import { SimulationRecordResponse } from 'src/models/simulation-record-response';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { SimulationRecord } from 'src/models/simulation-record';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'rbc-records-table',
  templateUrl: './records-table.component.html',
  styleUrls: ['./records-table.component.scss'],
})
export class RecordsTableComponent implements OnInit {

  page = 1;
  pageSize = 6;
  collectionSize = 0;
  pageSizeOptions = [2, 4, 6, 8];
  recordData: SimulationRecord[] = [];
  headers: string[];
  downloadIcon = faDownload;

  exportUrl = `${environment.serverEndpoint}/download`;

  @Input() public simulationRecordResponse: SimulationRecordResponse;

  constructor(
    private model: NgbActiveModal) {
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

  close() {
    this.model.close();
  }
}

