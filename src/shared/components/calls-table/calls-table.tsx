/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import { CALL_STATUS, ROUTES, useTheme } from '@shared/index';
import { TableSearchParams } from '@shared/types/table-search-params';
import { statusMenuItems } from '@shared/utils';
import { AppDispatch, CallsTableRecord, fetchCallHistory, updateCallStatus } from '@store/index';
import { Button, Card, Dropdown, Input, Space, Table, TableProps, Typography } from 'antd';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { useBoolean, useDebounceCallback } from 'usehooks-ts';
import { RecordDetailsModal } from './components';
import { ConfirmChangeStatusModal } from './components/confirm-change-status-modal';
import { useGetColumns } from './hooks';
import { ChangeStatusType } from './types';

type Props = {
  data?: CallsTableRecord[];
  searchParams?: TableSearchParams;
  onSearch: (value: string) => void;
  onTableChange?: TableProps<any>['onChange'];
  onReset: () => void;
  onRefresh?: () => void;
  refreshDisabled: boolean;
  title?: string;
  size?: SizeType;
  columns?: string[];
  onFilterChange: any;
};

export const CallsTable = ({
  data,
  onSearch,
  onTableChange,
  onFilterChange,
  onReset,
  onRefresh,
  refreshDisabled,
  searchParams,
  title,
  size = 'small',
  columns = ['date', 'status', 'address', 'comment', 'userFullName', 'action'],
}: Props) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeRowIndex, setActiveRowIndex] = useState<number>();

  const [detailsModalData, setDetailsModalData] = useState<CallsTableRecord>();
  const [changeStatusModalData, setChangeStatusModalData] = useState<ChangeStatusType>();

  const {
    value: isRecordDetailsModalOpen,
    setTrue: openRecordDetailsModal,
    setFalse: closeRecordDetailsModal,
  } = useBoolean();
  const {
    value: isConfirmStatusModalOpen,
    setTrue: openConfirmStatusModal,
    setFalse: closeConfirmStatusModal,
  } = useBoolean();

  const onRowClick = (record: CallsTableRecord, index: number) => {
    setActiveRowIndex(index);
    setDetailsModalData(record);
    openRecordDetailsModal();
  };

  const onUserClick = (record: CallsTableRecord & { userId: string }) => {
    navigate(`${ROUTES.USERS}/${record.userId}`);
  };

  const defaultColumns = useGetColumns({
    searchParams,
    onRowClick,
    onUserClick,
    setChangeStatusModalData,
    openChangeStatusModal: openConfirmStatusModal,
  });

  const visibleColumns = defaultColumns.filter((item) => columns.includes(item.key));

  const updateStatus = (id = '', newStatus?: CALL_STATUS) => {
    if (id && newStatus) {
      dispatch(updateCallStatus({ id, newStatus })).then(() =>
        dispatch(
          fetchCallHistory({
            search: searchParams?.search,
            page: searchParams?.pagination.current,
            limit: searchParams?.pagination.pageSize,
            userId: id,
            sort: searchParams?.sorter.field,
            order: searchParams?.sorter.order
              ? searchParams.sorter.order === 'ascend'
                ? 'asc'
                : 'desc'
              : undefined,
          }),
        ),
      );
    }
  };

  const getStatusMenuItems = (currentFilter?: string) =>
    [{ key: 'all', label: 'all' }, ...statusMenuItems].map((item) =>
      item.key === currentFilter ? { ...item, disabled: true } : item,
    );

  //TODO: вынести в отдельнй хук? логику связанную с полем поиска
  const debounced = useDebounceCallback((value) => {
    if (value) {
      onSearch(value);
    }
  }, 300);

  const [search, setSearch] = useState('');

  useEffect(() => {
    debounced(search);
  }, [search]);

  return (
    <div>
      <Card size="small" title={title}>
        <div className="flex  items-center justify-between mb-2">
          <div className="flex gap-2 items-center ">
            <Typography>Статус</Typography>
            <Dropdown
              menu={{
                items: getStatusMenuItems(searchParams?.filter),
                onClick: (value) => {
                  console.log('value: ', value);
                  onFilterChange(value.key);
                },
              }}>
              <a>
                <Space>
                  {
                    getStatusMenuItems(searchParams?.filter).find(
                      (item) => item.key === searchParams?.filter,
                    )?.label
                  }
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          </div>
          {onRefresh && (
            <Button
              disabled={refreshDisabled}
              onClick={() => {
                onRefresh();
              }}>
              Refresh
            </Button>
          )}
          <Button
            onClick={() => {
              onReset();
              setSearch('');
            }}>
            onReset
          </Button>
        </div>
        <Input.Search
          // TODO: перевод
          value={search}
          placeholder="Поиск"
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="mb-2"
        />
        <Table
          className="!p-0"
          size={size}
          // @ts-ignore
          columns={visibleColumns}
          dataSource={data}
          pagination={searchParams?.pagination}
          onChange={onTableChange}
          rowClassName={(_record, index) => {
            return index === activeRowIndex
              ? theme === 'dark'
                ? 'bg-neutral-800'
                : 'bg-neutral-100'
              : '';
          }}
          rowKey="id"
        />
      </Card>
      <RecordDetailsModal
        data={detailsModalData}
        open={isRecordDetailsModalOpen}
        currentStatus={detailsModalData?.status}
        onOk={() => {
          closeRecordDetailsModal();
          setDetailsModalData(undefined);
          setActiveRowIndex(undefined);
        }}
        onCancel={() => {
          closeRecordDetailsModal();
          setDetailsModalData(undefined);
          setActiveRowIndex(undefined);
        }}
        onStatusChange={(newStatus) => {
          setChangeStatusModalData({ item: detailsModalData!, newStatus: newStatus! });
          openConfirmStatusModal();
        }}
      />

      <ConfirmChangeStatusModal
        data={changeStatusModalData}
        open={isConfirmStatusModalOpen}
        onOk={() => {
          updateStatus(changeStatusModalData?.item.id, changeStatusModalData?.newStatus);
          closeConfirmStatusModal();
          setChangeStatusModalData(undefined);
        }}
        onCancel={() => {
          closeConfirmStatusModal();
          setChangeStatusModalData(undefined);
        }}
      />
    </div>
  );
};
